import React from "react";
import { IoCloseCircleOutline } from "react-icons/io5";
import { FaAnglesRight } from "react-icons/fa6";
import './css/moreInfo.css';

function MoreInfo({show, book, authors, id, onClose}) {
    

    if(show){
        document.body.classList.add('moreInfo-active');

        const data = book.info.volumeInfo;

        function subtitle(){
            try{
                const sub = data.subtitle;
                if(sub)
                    return sub;
                else
                    return "";
            }catch(error){
                console.log("error=" + error);
            }
        }

        function publishing(){
            try{
                const publisher = data.publisher;
                const date = data.publishedDate;

                if(publisher && date){
                    return publisher + " ~ " + date;
                }else if(!publisher && date){
                    return date;
                }else if(publisher && !date){
                    return publisher;
                }else{
                    return "-";
                } 
            }catch(error){
                console.log("error=" + error);
            }
        }

        function category(){
            try{
                const type = data.printType;
                const categories = data.categories;

                if(type){
                    if(type === "BOOK"){
                        if(categories){
                            return categories.join(", ");
                        }
                        else
                            return "-";
                    }else if(type === "MAGAZINE"){
                        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
                    }
                }else
                    return "-";
            }catch(error){
                console.log("error=" + error);
            }
        }
    
        function desc(){
            try{
                const desc = data.description;

                if(desc){
                    if(desc.length > 200){
                        return desc.split(" ").slice(0,40).join(" ") + "...";
                    }else{
                        return desc;
                    }
                }else{
                    return "";
                }
            }catch(error){
                console.log("error=" + error);
            }
        }

        return (
            <>
                <div className="moreInfo">
                    <div className="overlay" onClick={onClose}></div>
                    <div className="moreInfoContainer">
                        <button className="close" onClick={onClose}><IoCloseCircleOutline id="closeIcon"/></button>
                        <div className="moreInfoDetails">
                            <div className="moreInfo1">
                                <img src={data.imageLinks.thumbnail} alt="icon.png"></img>

                                <div className="titles">
                                    <span className="title">{data.title}</span>
                                    <span className="subtitle">{subtitle()}</span>
                                </div>
                            </div>

                            <div className="moreInfo2">
                                <span><b>Author: </b>{authors}</span>
                                <span><b>Published: </b>{publishing()}</span>
                                <span><b>ID: </b><i>{id}</i></span>
                                <span><b>Page count: </b>{data.pageCount}</span>
                                <span><b>Category: </b>{category()}</span>
                                <span><b>Language: </b>{data.language}</span>
                                <span id="desc">{desc()}</span>
                            </div>

                            <div className="evenMore">
                                <a href={data.infoLink} target="_blank" rel="noreferrer"><button>Read more <FaAnglesRight  id="shiftIcon"/></button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
        
    }
    else{
        document.body.classList.remove('moreInfo-active');
        return null;
    }    
}

export default MoreInfo;