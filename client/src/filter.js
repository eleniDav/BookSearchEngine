import React, { useState } from "react";
import "./css/filter.css";

function Filter({search, sort, rCount, r, s1, s2}) {
    //values passed from parent to child -- to show/keep the (previous)user choice every time the pop up shows
    const [searchBy, setSearchBy] = useState(s1);
    const [sortBy, setSortBy] = useState(s2);
    const [resultCount, setResultCount] = useState(r);

    //the values that we send from the child to the parent -- to alter the results based on these choices
    search(searchBy);
    sort(sortBy);
    rCount(resultCount);

    const passCount = (event) => {
        setResultCount(Number(event.target.value));
    }
    
    return (
        <>
            <div className="filterPopup">
                <div className="searchByFilter">
                    <span>Search by: </span>
                    <ul>
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
                        <li><input type="radio" id="description" checked={searchBy === ""} onChange={() => setSearchBy("")}></input>
                            <label htmlFor="all">Description</label></li>
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
                <div className="resultsPerPage">
                    <span>Results shown per page: </span>
                    <input type="number" id="quantity" min="1" max="40" value={resultCount} onChange={passCount} onKeyDown={() => {return false}}></input>
                </div>
            </div>
        </>
    )
}

export default Filter;