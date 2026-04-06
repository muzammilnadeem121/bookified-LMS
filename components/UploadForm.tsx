"use client"
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES, DEFAULT_VOICE } from '@/lib/constants';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImageIcon, Upload } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import LoadingOverlay from './LoadingOverlay';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import FileUploader from './FileUploader';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.actions';
import { useRouter } from 'next/navigation';
import { parsePDFFile } from '@/lib/utils';
import { upload } from '@vercel/blob/client';
import VoiceSelector from './VoiceSelector';

const UploadForm = () => {
    const [isSubmitting, setisSubmitting] = useState(false);
    const [isMounted, setisMounted] = useState(false);
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setisMounted(true);
    }, [])

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            persona: '',
            pdfFile: undefined,
            coverImage: undefined,
        }
    });

    const onSubmit = async (values: BookUploadFormValues) => {
        console.log("button submitted")

        if (!userId) {
            return toast.error("Please login to upload books")
        }
        setisSubmitting(true);

        try {
            const checkExists = await checkBookExists(values.title);

            if (checkExists.exists && checkExists.data) {
                toast.info("Book with the same title already exists.")
                form.reset();
                router.push(`/books/${checkExists.data.slug}`);
                return;
            }

            const fileTitle = values.title.replace(/\s+/g, '_').toLowerCase();
            const pdfFile = values.pdfFile;
            console.log("parsing pdf")

            const parsedPdf = await parsePDFFile(pdfFile);
            if (parsedPdf.content.length == 0) {
                toast.error("Failed to parse PDF! Please try again with different file.")
                console.log("failed to parse pdf")
                return;
            }

            console.log("pdf parsed successfully")

            console.log("now uploading pdf to blob")

            const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
                access: "public",
                handleUploadUrl: "/api/upload",
                contentType: "application/pdf"
            });
            console.log("pdf uploaded successfully")

            let coverUrl: string;

            if (values.coverImage) {
                const coverFile = values.coverImage;

                console.log("now uploading cover to blob")
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                    access: "public",
                    handleUploadUrl: "/api/upload",
                    contentType: "image/png"
                })
                console.log("uploaded cover image")
                coverUrl = uploadedCoverBlob.url;
            } else {
                const response = await fetch(parsedPdf.cover);
                const blob = await response.blob()

                console.log("now uploading cover to blob")
                const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                    access: "public",
                    handleUploadUrl: "/api/upload",
                    contentType: "image/png"
                })

                coverUrl = uploadedCoverBlob.url;
                console.log("uploaded cover image")
            }
            console.log("creating book")
            const book = await createBook({
                clerkId: userId,
                title: values.title,
                author: values.author,
                persona: values.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size
            })

            console.log("book created succesfully")

            if (!book.success) throw new Error("Failed to create book.")

            if (book.alreadyExists) {
                toast.info("Book already Exists.");
                form.reset();
                router.push(`/books/${checkExists.data.slug}`)
                return;
            }

            const segments = await saveBookSegments(book.data._id, userId, parsedPdf.content);
            if (!segments.success) {
                toast.error("Failed to save book Segments");
            }

            form.reset();
            router.push("/");

        } catch (error) {
            console.error(error);
            toast.error("Failed to upload! Please try again later.")
        } finally {
            setisSubmitting(false);
        }

    }

    if (!isMounted) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay />}

            <div className="new-book-wrapper">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FileUploader control={form.control} name='pdfFile' label="Book PDF File" acceptTypes={ACCEPTED_PDF_TYPES} icon={Upload} placeholder="Click to Upload PDF" hint="PDF File (max 50MB)" disabled={isSubmitting}></FileUploader>
                        <FileUploader control={form.control} name="coverImage" label="Cover Image (optional)" acceptTypes={ACCEPTED_IMAGE_TYPES} icon={ImageIcon} placeholder="Click to Upload Cover Image" hint="leave empty to auto generate from PDF" disabled={isSubmitting}></FileUploader>

                        <FormField control={form.control} name="title" render={({ field }) => {
                            return <FormItem>
                                <FormLabel className="form-label">Title</FormLabel>
                                <FormControl>
                                    <Input className="form-input" placeholder="ex: Rich Dad Poor Dad" {...field} disabled={isSubmitting}></Input>
                                </FormControl>
                                <FormMessage></FormMessage>
                            </FormItem>
                        }}></FormField>

                        <FormField control={form.control} name="author" render={({ field }) => {
                            return <FormItem>
                                <FormLabel className="form-label">Author Name</FormLabel>
                                <FormControl>
                                    <Input className="form-input" placeholder="ex: Robert Kiyosaki" {...field} disabled={isSubmitting}></Input>
                                </FormControl>
                                <FormMessage></FormMessage>
                            </FormItem>
                        }}></FormField>

                        <FormField
                            control={form.control}
                            name="persona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                    <FormControl>
                                        <VoiceSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <Button type="submit" className="form-btn" disabled={isSubmitting}>
                            Begin Synthesis
                        </Button>

                    </form>
                </Form>
            </div>

        </>
    )
}

export default UploadForm