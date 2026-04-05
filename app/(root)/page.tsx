import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import { sampleBooks } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <main className="wrapper container">

        <HeroSection></HeroSection>

        <div className="library-books-grid">
            {
              sampleBooks.map((book)=>{
                return <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug}></BookCard>
              })
            }
        </div>
      </main>
    </>    
  );
}
