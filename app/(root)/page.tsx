import BookCard from "@/components/BookCard";
import HeroSection from "@/components/HeroSection";
import { getAllBooks } from "@/lib/actions/book.actions";
import { sampleBooks } from "@/lib/constants";

export default async function Home() {
  const bookResults = await getAllBooks()
  const books = bookResults.success ? bookResults.data ?? [] : [];

  return (
    <>
      <main className="wrapper container">

        <HeroSection></HeroSection>

        <div className="library-books-grid">
            {
              books.map((book)=>{
                return <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug}></BookCard>
              })
            }
        </div>
      </main>
    </>    
  );
}
