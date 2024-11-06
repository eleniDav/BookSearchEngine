import React, { useState } from "react";
import { GoSearch } from 'react-icons/go';
import Books from './books';

function Content(){
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const handleInput = (e) => {
        setInputValue(e.target.value);
    }

    const search = () => {
        fetch('https://www.googleapis.com/books/v1/volumes?q='+inputValue+'&maxResults=30&key=AIzaSyCodWW4QEp3pi-Jrs3luihob2SpYS1vMow')
        .then(response => response.json())
        .then(data => setData(data.items))
        .catch(err => console.error('error fetching data:', err));
    }

    const search2 = (e) => {
        if(e.key === "Enter")
            search();
    }

    return (
        <>
        <div className="searchBarContainer">
            <div className="searchBar">
                <input type="text" id="searchInput" placeholder={"Type a book title or an author's name.."} value={inputValue} onChange={handleInput} onKeyUp={search2}></input>
                <button onClick={search}><GoSearch id="searchIcon" /></button>
            </div>
            <div className="results">
                <h1>books returned</h1>
                <ul className="bookComponents">
                <Books />
                <Books />
                <Books />
                    {data.map(item => (
                        <li key={item.id}>{item.volumeInfo.title} - {item.volumeInfo.authors}</li>
                    ))}
                </ul>
            </div>
        </div>
        
        </>
    );
}

export default Content;