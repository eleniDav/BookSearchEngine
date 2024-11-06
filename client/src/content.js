import React, { useState } from "react";
import { GoSearch } from 'react-icons/go';

function Content(){
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState("");

    const handleInput = (e) => {
        setInputValue(e.target.value);
    }

    const fere = () => {
        fetch('https://www.googleapis.com/books/v1/volumes?q='+inputValue+'&maxResults=30&key=AIzaSyCodWW4QEp3pi-Jrs3luihob2SpYS1vMow')
        .then(response => response.json())
        .then(data => setData(data.items))
        .catch(err => console.error('error fetching data:', err));
    }

    return (
        <>
        <div className="searchBarContainer">
            <div className="searchBar">
                <GoSearch id="searchIcon" />
                <input type="text" id="searchInput" placeholder={"Type a book title or an author's name.."} value={inputValue} onChange={handleInput} onBlur={fere}></input>
            </div>
            <div className="results">
                <h1>books returned</h1>
                <ul>
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