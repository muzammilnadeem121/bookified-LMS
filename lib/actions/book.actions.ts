'use server';
import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import book from "@/database/models/book.model";
import bookSegment from "@/database/models/bookSegment.model";

export const getAllBooks = async ()=>{
    try {
        await connectToDatabase();
        const books = await book.find().sort({createdAt: -1}).lean();
        return {
            success: true,
            data: serializeData(books)
        }
    } catch (error) {
        console.error("error fetching books: " + error);
        return {
            success: false, error
        }
    }
}

export const checkBookExists = async (title : string)=>{
    try {
        await connectToDatabase();
        const slug = generateSlug(title);

        const existingBook = await book.findOne({slug}).lean()

        if(existingBook){
            return {
                exists: true, data: serializeData(existingBook)
            }
        }

        return {
            exists: false
        }

    } catch (error) {
        console.error("eror checking book exists " + error);
        return {
            exists: false,
            error: error
        }
    }
}



export const createBook = async (data: CreateBook)=>{
    try{
        await connectToDatabase();
        const slug = generateSlug(data.title);

        const existingBook = await book.findOne({slug}).lean();

        if (existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true
            }
        }

        const Book = await book.create({...data, slug, totalSegments: 0})
        return {
            success: true,
            data: serializeData(Book),
        }

    } catch (e){
        console.error("Error creating a book: " + e);
        return {
            success: false,
            error: e
        }
    }
}

export const saveBookSegments = async (bookId: string, clerkId: string, segments: TextSegment[])=>{
    try {
        await connectToDatabase();
        console.log("saving book segments")

        const segmentsToInsert = segments.map(({text, segmentIndex, pageNumber, wordCount})=>{
            return {
                clerkId,
                bookId,
                content: text,
                segmentIndex,
                pageNumber,
                wordCount
            }
        })

        await bookSegment.insertMany(segmentsToInsert);

        await book.findByIdAndUpdate(bookId, {totalSegments: segments.length})

        console.log("segments saved succesfully!");

        return {
            success: true,
            segmentsCreated: segments.length
        }

    } catch (error) {
        console.error("error saving boook Segments: "+ error);
        await bookSegment.deleteMany({ bookId });
        await book.findByIdAndDelete(bookId);
        console.info("deleted book segments and book due to failure to save segments")
        return {
            success: false,
            error,
        }
    }
}