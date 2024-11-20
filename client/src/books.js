import React from "react";
import MoreInfo from "./moreInfo";
import { useState } from "react";

function Books(props) {
    console.log(props.info);
    
    const data = props.info.volumeInfo;
    let authors = data.authors;
    let code = data.industryIdentifiers;
    let picture = data.imageLinks.thumbnail;

    //to show more info for each book
    const [show, setShow] = useState(false);
    const [book, setBook] = useState();

    function fetchAuthors(){
        try{
            if(authors.length > 2)
                authors = authors[0] + ", " + authors[1] + " ...";
            else if(authors.length === 2)
                authors = authors[0] + ", " + authors[1];
            else
                authors = authors[0];

            return authors;
        }catch(error){
            console.log(error);
        }
    }

    //only isbn13.. make it for isbn10 too later
    function isbn(){
        try {
            if(!code)
                code = "-";
            else {
                if (code[0].type === "ISBN_13")
                    code = code[0].identifier;
                else if (code.length > 1 && code[1].type === "ISBN_13")
                    code = code[1].identifier;
                else
                    code = "-";
            }

            return code;
        } catch (error) {
            console.log("error=" + error);
        }
    }

    if (authors && picture) {
        return (
            <>
                <div className="bookContainer" onClick={()=> {setShow(true); setBook(props)}}>
                    <div className="bookInfo">
                        <img src={picture} alt="icon.png"></img>
                        <div className="info">
                            <span className="title">{data.title}</span>
                            <p>{fetchAuthors()}</p>
                            <span>Published: {data.publishedDate}</span>
                            <div className="bookInfoFooter">
                                <br></br>
                                <hr></hr>
                                <span>ISBN: {isbn()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <MoreInfo show={show} book={book} authors={authors} isbn={code} onClose={()=> setShow(false)}/>
            </>
        )
    }
}

export default Books;