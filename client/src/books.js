import React from "react";
import MoreInfo from "./moreInfo";
import { useState } from "react";

function Books(props) {

    const data = props.info.volumeInfo;
    let authors = data.authors;
    let publisher = data.publisher;
    let id = data.industryIdentifiers; 
    let picture = data.imageLinks && data.imageLinks.thumbnail;

    //to show more info for each book
    const [show, setShow] = useState(false);
    const [book, setBook] = useState();

    function fetchAuthors(){
        try{
            if(authors){
                if(authors.length > 2)
                    authors = authors[0] + ", " + authors[1] + " ...";
                else if(authors.length === 2)
                    authors = authors[0] + ", " + authors[1];
                else
                    authors = authors[0];
            }else{
                authors = "-";
            }
            return authors;
        }catch(error){
            console.log(error);
        }
    }

    function fetchPublisher(){
        try{
            if(publisher)
                return publisher;
            else
                return "-";
        }catch(error){
            console.log(error);
        }
    }

    function ID(){
        try {
            if(id){
                if(id.length === 1){
                    id = id[0].identifier;
                }else if (id.length > 1){
                    //all possible values of type
                    let isbn13 = id.find(code => code.type === "ISBN_13");
                    let isbn10 = id.find(code => code.type === "ISBN_10");
                    let issn = id.find(code => code.type === "ISSN");
                    let other = id.find(code => code.type === "OTHER");
                    //will get the value of the first not null - hierarchy/preference 
                    id = isbn13.identifier || isbn10.identifier || issn.identifier || other.identifier;
                }
            }else
                id = "-";
            return id;
        } catch (error) {
            console.log("error=" + error);
        }
    }


    try{
        if (picture) {
            return (
                <>
                    <div className="bookContainer" onClick={()=> {setShow(true); setBook(props)}}>
                        <div className="bookInfo">
                            <div className="mainInfo">
                                <img src={picture} alt=""></img>
                                <div className="info">
                                    <span className="title">{data.title}</span>
                                    <p>{fetchAuthors()}</p>
                                    <span>Publisher: {fetchPublisher()}</span>
                                </div>
                            </div>
                            <div className="bookInfoFooter">
                                <br></br>
                                <hr></hr>
                                <span>ID: {ID()}</span>
                            </div>
                        </div>
                    </div>
                    <MoreInfo show={show} book={book} authors={authors} id={id} onClose={() => setShow(false)}/>
                </>
            )
    }}catch(error){
        console.log("error=" +error);
    }
}

export default Books;