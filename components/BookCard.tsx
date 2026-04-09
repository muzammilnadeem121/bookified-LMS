"use client"
import { BookCardProps } from '@/types'
import { useAuth, useClerk } from '@clerk/nextjs';
import Image from 'next/image'
import { useRouter } from 'next/navigation';

const BookCard = ({ title, author, coverURL, slug }: BookCardProps) => {

    const { userId } = useAuth()
    const { openSignIn } = useClerk();
    const router = useRouter();
    async function handleClick(){
        
          if (!userId) {
            openSignIn({
                forceRedirectUrl: `/books/${slug}`
              });
          }else {
            router.push(`/books/${slug}`);
          }
    }

    return (
        <button onClick={handleClick} className='cursor-pointer'>
            <article className={"book-card"}>
                <figure className='book-card-figure'>
                    <div className="book-card-cover-wrapper">
                        <Image src={coverURL} alt={slug} width={133} height={200} className='book-card-cover' unoptimized></Image>
                    </div>
                </figure>
                <figcaption className='book-card-meta'>
                    <h3 className='book-card-title'>{title}</h3>
                    <p className='book-card-author'>{author}</p>
                </figcaption>
            </article>
        </button>
    )
}

export default BookCard