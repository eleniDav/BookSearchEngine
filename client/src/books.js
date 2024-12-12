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

    function ISBN(){
        try {
            if(id){
                //i only want isbn 13 or 10, any other id is kinda useless
                let isbn13 = id.find(code => code.type === "ISBN_13");
                let isbn10 = id.find(code => code.type === "ISBN_10");
                
                if(isbn13)
                    id = isbn13.identifier;
                else if(isbn10)
                    id = isbn10.identifier;
                else
                    id = "-";
            }else
                id = "-";
            return id;
        } catch (error) {
            console.log("error=" + error);
        }
    }

    try{        
            return (
                <>
                    <div className="bookContainer" onClick={()=> {setShow(true); setBook(props)}}>
                        <div className="bookInfo">
                            <div className="mainInfo">
                                <img src={picture ? picture : "icon.png"} alt=""></img>
                                <div className="info">
                                    <span className="title">{data.title}</span>
                                    <p>{fetchAuthors()}</p>
                                    <span>Publisher: {fetchPublisher()}</span>
                                    <span>{props.i}</span>
                                </div>
                            </div>
                            <div className="bookInfoFooter">
                                <br></br>
                                <hr></hr>
                                <span>ISBN: {ISBN()}</span>
                            </div>
                        </div>
                    </div>
                    <MoreInfo show={show} book={book} authors={authors} id={id} onClose={() => setShow(false)}/>
                </>
            )
    }catch(error){
        console.log("error=" +error);
    }
}

export default Books;