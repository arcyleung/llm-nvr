#!/usr/bin/env python
# coding: utf-8

# In[2]:


import datetime
import json
import os
import sqlite3
from pathlib import Path

import flash_attn
import torch
from dotenv import load_dotenv
from PIL import Image
from transformers import (BitsAndBytesConfig,
                          LlavaNextForConditionalGeneration,
                          LlavaNextProcessor)
load_dotenv()
frigate_db_file_path = os.environ['FRIGATE_DB_FILE_PATH']
conn = sqlite3.connect(frigate_db_file_path)
cursor = conn.cursor()
debug_out = True

if debug_out:
    print("Tables:")
    for row in cursor.execute("SELECT name FROM sqlite_master WHERE type='table';"):
        print(row[0])

# Define the start time (now - 24 hours)
end_time = datetime.datetime.now()
start_time = end_time - datetime.timedelta(hours=(24))

# print("schema:", cursor.execute("SELECT * FROM event").description)

# Read the "event" table and filter records with "start_time" within the last 24 hours
print("start_time:", start_time.timestamp())
print("end_time:", end_time.timestamp())
cursor.execute("SELECT * FROM event WHERE start_time >= :start_time AND start_time <= :end_time",
               {'start_time': start_time.timestamp(), 'end_time': end_time.timestamp()})
events = cursor.fetchall()

# Print the filtered events
if debug_out:
    print(len(events), "events found")
ids = [f"{event[2]}-{event[0]}" for event in events]
# for event in events:
#     print(event)
#     print(event[0], event[1])
# print(ids)
# Create table if it doesn't exist
# Must make frigate.db have permissions to write to it
cursor.execute("BEGIN")
cursor.execute(
    "CREATE TABLE IF NOT EXISTS transcribed (id TEXT PRIMARY KEY, transcript TEXT, transcribed_at INTEGER)")
cursor.execute("COMMIT")
conn.close()


# In[3]:


def get_filenames(path, ids=None):
    filenames = []
    if ids is not None:
        for id in ids:
            filenames.append(os.path.join(path, id) + "-clean.png")
    else:
        for root, dirs, files in os.walk(path):
            for file in files:
                if file.endswith('-clean.png'):
                    filenames.append(os.path.join(root, file))
    return filenames


prefix = os.getenv("FRIGATE_CLIPS_PATH")

filenames = get_filenames(prefix, ids)
if (debug_out):
    print(prefix, filenames)
  
# In[4]:

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

processor = LlavaNextProcessor.from_pretrained(
    "llava-hf/llava-v1.6-mistral-7b-hf")

model = LlavaNextForConditionalGeneration.from_pretrained(
    "llava-hf/llava-v1.6-mistral-7b-hf",
    torch_dtype=torch.float16,
    quantization_config=quantization_config,
    low_cpu_mem_usage=True,
    attn_implementation="flash_attention_2"
)
# model.to("cuda:0")

# Define a chat histiry and use `apply_chat_template` to get correctly formatted prompt
# Each value in "content" has to be a list of dicts with types ("text", "image")
conversation = [
    {

        "role": "user",
        "content": [
            {"type": "text", "text": "Describe any people in the scene, what clothing they are wearing, orientation with other objects, anything they are holding and what do they appear to be doing. Also describe prominent vehicles or legible text, and do not mention anything that should be ordinary."},
            {"type": "image"},
        ],
    },
]
prompt = processor.apply_chat_template(
    conversation, add_generation_prompt=True)


# In[1]:


def transcribe_one(filename, responses):
    image = Image.open(filename)
    inputs = processor(prompt, image, return_tensors="pt").to("cuda")

    # autoregressively complete prompt
    output = model.generate(**inputs, max_new_tokens=305)

    text = processor.decode(output[0], skip_special_tokens=True)
    responses[filename] = text[len(prompt) - 5:]


def upsert_transcriptions_to_sqlite3(responses, cursor=None, conn=None, transcribed_at=None):
    if (conn is None):
        conn = sqlite3.connect('frigate_db_file_path')
        cursor = conn.cursor()
    elif (cursor is None):
        print("No db cursor provided")
        cursor = conn.cursor

    if transcribed_at is None:
        transcribed_at = int(datetime.datetime.now().timestamp())

    def filepath_to_id(filename):
        if (debug_out):
            print(filename)
        splitted = filename.split("-")
        return splitted[1] + "-" + splitted[2]

    records = [(filepath_to_id(filename), text, transcribed_at)
               for filename, text in responses.items()]

    for record in records:
        if debug_out:
            print(f"attempting to upsert {record}")
        cursor.execute("BEGIN")
        try:
            cursor.execute(
                "INSERT INTO transcribed (id, transcript, transcribed_at) VALUES(?, ?, ?) ON CONFLICT(id) DO UPDATE SET transcript=EXCLUDED.transcript, transcribed_at=EXCLUDED.transcribed_at", record)
        except Exception as ex:
            cursor.execute("ROLLBACK")
            if (debug_out):
                print(f"{record} failed to be inserted")
            print(ex)
            continue
        else:
            cursor.execute("COMMIT")
            if (debug_out):
                print(f"success! {record} was inserted")


# In[6]:


# responses = json.load(open(f"/home/arcyleung/Projects/llm-nvr/transcribed/analyze_2024-08-12T20:08:12.464352.json", "r"))

# print(responses)
# upsert_transcriptions_to_sqlite3(responses, cursor)


# In[7]:

responses = {}
today = datetime.datetime.now().isoformat()
conn = sqlite3.connect(frigate_db_file_path)
cursor = conn.cursor()

for idx, filename in enumerate(filenames):
    print(f"processing file {idx + 1} of {len(filenames)}")
    try:
        transcribe_one(filename, responses)
    except FileNotFoundError as e:
        print(e)
        continue
    else:
        # upsert every 20 images processed.  going over images more than once
        # will update their db record and description.
        if ((idx+1) % 20 == 0):
            upsert_transcriptions_to_sqlite3(
                responses, conn=conn, cursor=cursor)
            time_formatted=datetime.datetime.now().strftime("%Y%M%d%H%M%S")
            output_file = f"{os.getcwd()}/transcribed/analyze_{time_formatted}.json"
            if (debug_out):
                print(f"dumping the last recordset to {output_file}.")
            json.dump(responses, open(output_file, "w"))
            responses.clear()


conn.close()
# transcrib e_one("/tmp/storage/clips/front-1722009392.383259-1jcmy8-clean.png", responses)


# In[8]:


# print(responses)

