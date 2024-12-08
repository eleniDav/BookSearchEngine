import React, { useState } from "react";
import "./css/filter.css";

function Filter({search, sort, callbackProp, s1, s2}) {
    //values passed from parent
    const [searchBy, setSearchBy] = useState(s1);
    const [sortBy, setSortBy] = useState(s2);

    const filterResults = () => {
        search(searchBy);
        sort(sortBy);

        //will call search from parent to fetch the filtered results
        callbackProp();
        console.log("calling from child");
    }
    
    return (
        <>
            <div className="filterPopup">
                <div className="searchByFilter">
                    <span>Search by: </span>
                    <ul>
                        <li><input type="radio" id="all" checked={searchBy === ""} onChange={() => setSearchBy("")}></input>
                            <label htmlFor="all">All fields</label></li>
                        <li><input type="radio" id="title" checked={searchBy === "intitle:"} onChange={() => setSearchBy("intitle:")}></input>
                            <label htmlFor="title">Title</label></li>
                        <li><input type="radio" id="isbn" checked={searchBy === "isbn:"} onChange={() => setSearchBy("isbn:")}></input>
                            <label htmlFor="isbn">ISBN</label></li>
                        <li><input type="radio" id="author" checked={searchBy === "inauthor:"} onChange={() => setSearchBy("inauthor:")}></input>
                            <label htmlFor="author">Author</label></li>
                        <li><input type="radio" id="publisher" checked={searchBy === "inpublisher:"} onChange={() => setSearchBy("inpublisher:")}></input>
                            <label htmlFor="publisher">Publisher</label></li>
                        <li><input type="radio" id="category" checked={searchBy === "subject:"} onChange={() => setSearchBy("subject:")}></input>
                            <label htmlFor="category">Category</label></li>
                    </ul>
                </div>
                <div className="sortByFilter">
                    <span>Sort by: </span>
                    <ul>
                        <li><input type="radio" id="relevancy" checked={sortBy === "relevance"} onChange={() => setSortBy("relevance")}></input>
                            <label htmlFor="relevancy">Most relevant</label></li>
                        <li><input type="radio" id="newest" checked={sortBy === "newest"} onChange={() => setSortBy("newest")}></input>
                            <label htmlFor="newest">Most Recently Published</label></li>
                    </ul>
                </div>
                <button onClick={filterResults}>Filter Results</button>
            </div>
        </>
    )
}

export default Filter;