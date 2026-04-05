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

const UploadForm = () => {
    const [isSubmitting, setisSubmitting] = useState(false);
    const [isMounted, setisMounted] = useState(false);

    useEffect(()=>{
        setisMounted(true);
    }, [])

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            voice: DEFAULT_VOICE
        }
    });

    const onSubmit = async (values: BookUploadFormValues)=>{
        setisSubmitting(true);
        await new Promise((resolve)=> setTimeout(resolve, 3000));
        setisSubmitting(false);
    }

    if (!isMounted) return null;

  return (
    <>
        {isSubmitting && <LoadingOverlay/>}

        <div className="new-book-wrapper">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                    <FileUploader control={form.control} name="bookFile" label="Book PDF File" acceptTypes={ACCEPTED_PDF_TYPES} icon={Upload} placeholder="Click to Upload PDF" hint="PDF File (max 50MB)" disabled={isSubmitting}></FileUploader>
                    <FileUploader control={form.control} name="coverImage" label="Cover Image (optional)" acceptTypes={ACCEPTED_IMAGE_TYPES} icon={ImageIcon} placeholder="Click to Upload Cover Image" hint="leave empty to auto generate from PDF" disabled={isSubmitting}></FileUploader>

                    <FormField control={form.control} name="title" render={({ field })=>{
                        return <FormItem>
                            <FormLabel className="form-label">Title</FormLabel>
                            <FormControl>
                                <Input className="form-input" placeholder="ex: Rich Dad Poor Dad" {...field} disabled={isSubmitting}></Input>
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                    }}></FormField>

                    <FormField control={form.control} name="author" render={({ field })=>{
                        return <FormItem>
                            <FormLabel className="form-label">Author Name</FormLabel>
                            <FormControl>
                                <Input className="form-input" placeholder="ex: Robert Kiyosaki" {...field} disabled={isSubmitting}></Input>
                            </FormControl>
                            <FormMessage></FormMessage>
                        </FormItem>
                    }}></FormField>


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