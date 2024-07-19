from fastapi import FastAPI, Depends, HTTPException, status
from bson import ObjectId
from pymongo import MongoClient
from models import NoteCreate, NoteUpdate, NoteInDB
from auth import get_current_user, User
from datetime import datetime
from typing import List

app = FastAPI()

mongo_uri = "mongodb://localhost:27017/?directConnection=true"
client = MongoClient(mongo_uri)
db = client["note_app"]
notes_collection = db["notes"]

@app.post("/notes", response_model=NoteInDB)
async def create_note(note: NoteCreate, current_user: User = Depends(get_current_user)):
    note_dict = note.dict()
    note_dict["owner_id"] = current_user.id
    note_dict["created_at"] = datetime.utcnow()
    note_dict["updated_at"] = datetime.utcnow()
    new_note = notes_collection.insert_one(note_dict)
    created_note = notes_collection.find_one({"_id": new_note.inserted_id})
    return NoteInDB(**created_note, id=str(created_note["_id"]))

@app.get("/notes", response_model=List[NoteInDB])
async def read_notes(skip: int = 0, limit: int = 10, current_user: User = Depends(get_current_user)):
    notes = notes_collection.find({"owner_id": current_user.id}).skip(skip).limit(limit)
    return [NoteInDB(**note, id=str(note["_id"])) for note in notes]

@app.get("/notes/{note_id}", response_model=NoteInDB)
async def read_note(note_id: str, current_user: User = Depends(get_current_user)):
    note = notes_collection.find_one({"_id": ObjectId(note_id), "owner_id": current_user.id})
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteInDB(**note, id=str(note["_id"]))

@app.put("/notes/{note_id}", response_model=NoteInDB)
async def update_note(note_id: str, note: NoteUpdate, current_user: User = Depends(get_current_user)):
    note_dict = note.dict()
    note_dict["updated_at"] = datetime.utcnow()
    result = notes_collection.update_one({"_id": ObjectId(note_id), "owner_id": current_user.id}, {"$set": note_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    updated_note = notes_collection.find_one({"_id": ObjectId(note_id)})
    return NoteInDB(**updated_note, id=str(updated_note["_id"]))

@app.delete("/notes/{note_id}", response_model=NoteInDB)
async def delete_note(note_id: str, current_user: User = Depends(get_current_user)):
    note = notes_collection.find_one_and_delete({"_id": ObjectId(note_id), "owner_id": current_user.id})
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return NoteInDB(**note, id=str(note["_id"]))
