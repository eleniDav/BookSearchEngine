import React from "react";
import "./css/otherPages.css";
import { IoLibrary } from "react-icons/io5";

function API() {

    return (
        <>
            <div className="searchBarContainer">
                <div className="otherPagesContainer">
                    <h3 className="header_other">Google Books API</h3>
                    <div className="gb">
                        <a href="https://books.google.com/" target="_blank" rel="noreferrer"><img src="google_books.png" alt="" className="google"></img></a>
                        <p>Google Books is a service provided by Google that acts as a digital library where users can easily search for book 
                            information online and get navigated into purchasing or borrowing books, if there is availability for that function. 
                            Google Books also allows users to make their own libraries and save books for future use.</p>
                    </div>
                    <div className="gbapi">
                    <a href="https://developers.google.com/books" target="_blank" rel="noreferrer"><img src="google_books_api.png" alt="" className="google_api"></img></a>
                        <p>Google Books API is a powerful tool that Google provides for developers to integrate some of Google Books’ properties 
                            in their applications. This API provides all the necessary information, like book titles, names of authors and 
                            publishers, descriptions etc, to construct useful applications for searching and retrieving book volumes of a vast 
                            variety.</p>
                    </div>  
                    <div className="footerOther">               
                        <IoLibrary className="claimIcon"/><p>All of the book data used in this search engine derive from the Google Books API.</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default API;