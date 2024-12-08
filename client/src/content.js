import React, { useCallback, useEffect, useState } from "react";
import { GoSearch } from 'react-icons/go';
import { RiEqualizerLine } from "react-icons/ri";
import Books from './books';
import Filter from './filter';
import Popup from 'reactjs-popup';

function Content(){
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [final, setFinal] = useState("");
    const [stopwords, setStopwords] = useState([]);

    //default values
    const [searchByOption, setSearchByOption] = useState("");
    const [sortByOption, setSortByOption] = useState("relevance");

    const key = "AIzaSyCodWW4QEp3pi-Jrs3luihob2SpYS1vMow";
    //here ill handle sorting & paginating too    

    //set the stopwords from txt file(source:nltk library) to a local array - will be executed only once on the first render
    useEffect(() =>{
        fetch("stopwords.txt")
        .then(res => res.text())
        .then((stoppers) => {
            setStopwords(stoppers.split(/\r?\n/));
        })
        .catch(err => console.error("error= " + err));
    },[]);

    //query preparation
    function queryPrep(){        
        let query = inputValue;

        //lowercase
        let lower = query.toLowerCase();

        //remove html tags completely
        let firstofall = removeHtml(lower);
        
        //remove special characters,non-whitespace,non-alphanumeric characters,emojis/emoticons etc 
        let readySentence = firstofall.replace(/[^a-zA-Z\d\s']/g, '');
        
        //tokenization - split when you see at least one whitespace character
        let tokens = readySentence.split(/\s+/);

        //remove any empty tokens
        let tokens2 = tokens.filter(t => t !== '');

        //stemming

        //stop-word removal (from nltk library) - handles contractions too (MUST BE LAST STEP)
        let cleaned = stopWordRemoval(tokens2);

        console.log(cleaned);

        return cleaned;
    }

    function removeHtml(str){
        return str.replace(/<[^>]*>/g,'');
    }

    function stopWordRemoval(tokenArray){
        let r = [];
        for(let i=0;i<tokenArray.length;i++)
            if(!stopwords.includes(tokenArray[i]))
                r.push(tokenArray[i]);
        return r;
    }

    function search(){
            try{
                if(queryPrep() && queryPrep().length > 0){
                    //asynchronous call to API
                    fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${queryPrep()}&orderBy=${sortByOption}&maxResults=40&key=${key}`)
                    .then(response => response.json())
                    .then(data => setData(data.items))
                    .then(setFinal(inputValue))
                    .catch(err => console.error('error fetching data:', err));
                }else{
                    getResultMessage();
                }
            }catch(error){
                console.log("error = " + error);
            }
    }

    //useCallback hook so function wont automatically run on every render (and affect our useEffect) - it will run only when its dependencies update
    const getResultMessage = useCallback(() => {
        const resultInfoElem = document.getElementById("resultInfo");
        if(data && data.length !== 0 && final){
            resultInfoElem.innerHTML = "Results for: \"" + removeHtml(final) + "\" - " + data.length + " books returned";
        }else if(final){
            resultInfoElem.innerHTML = "Sorry.. no books found for: \"" + removeHtml(final) + "\" in this field..";
        }else{
            resultInfoElem.innerHTML = "Please examine your search query again.. seems like something went wrong..";
        }       
    },[data, final]);

    //runs on the first render & any time the dependency values change
    useEffect(() => {
        if(data && data.length !== 0){
            getResultMessage();
        }
    },[data, getResultMessage]);

    function search2(event){
        if(event.key === "Enter"){
            search();
        }        
    }

    return (
        <>
            <div className="searchBarContainer">
                <div className="searchBar">
                    <input type="text" id="searchInput" placeholder={"Type a book title or an author's name.."} onChange={(event) => {setInputValue(event.target.value);}} onKeyUp={search2}></input>
                    <Popup trigger={<button ><RiEqualizerLine id="filterIcon"/></button>} position="bottom center">
                        <Filter search={(searchBy) => setSearchByOption(searchBy)} sort={(sortBy) => setSortByOption(sortBy)} callbackProp={search} s1={searchByOption} s2={sortByOption}/> 
                    </Popup>
                    <button onClick={search}><GoSearch id="searchIcon" /></button>
                                   
                </div>
                <div className="results">
                    <h2 id="resultInfo"> </h2>
                    <ul className="bookComponents">
                        {data ? data.map(item => (
                            <Books key={item.etag} info={item}/>
                        )) : getResultMessage()}
                        {console.log(data)}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default Content;