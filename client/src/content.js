import React, { useCallback, useEffect, useState } from "react";
import { GoSearch } from 'react-icons/go';
import { RiEqualizerLine } from "react-icons/ri";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import Books from './books';
import Filter from './filter';
import Popup from 'reactjs-popup';

function Content(){
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [final, setFinal] = useState("");
    const [stopwords, setStopwords] = useState([]);

    const [min, setMin] = useState(0);
    const [max, setMax] = useState(10);
    const [page, setPage] = useState(1);

    let i=1; //so i wont be counting in pagination

    //default values
    const [searchByOption, setSearchByOption] = useState("");
    const [sortByOption, setSortByOption] = useState("relevance");

    const key = "AIzaSyCodWW4QEp3pi-Jrs3luihob2SpYS1vMow";  

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
        //initialize them with every new search
        setMin(0);
        setMax(10);
        setPage(1);

        try {
            if (queryPrep() && queryPrep().length > 0) {
                //asynchronous call to API
                fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${queryPrep()}&orderBy=${sortByOption}&maxResults=40&key=${key}`)
                    .then(response => response.json())
                    .then(console.log(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${queryPrep()}&orderBy=${sortByOption}&maxResults=40&key=${key}`))
                    .then(data => setData(data.items))
                    .then(setFinal(inputValue))
                    .catch(err => console.error('error fetching data:', err));
            } else {
                getResultMessage();
            }
        } catch (error) {
            console.log("error = " + error);
        }
    }

    //useCallback hook so function wont automatically run on every render (and affect our useEffect) - it will run only when its dependencies update
    const getResultMessage = useCallback(() => {
        const resultInfoElem = document.getElementById("resultInfo");
        const pages = document.getElementById("pages");
        if(data && data.length !== 0 && final){
            resultInfoElem.innerHTML = "Results for: \"" + removeHtml(final) + "\" - " + data.length + " books returned";
            pages.style.display = "";
            document.getElementById("prev").style.display ="none";
            if(data && (data.length <= 10)){
                document.getElementById("next").style.display = "none";
            }else{
                document.getElementById("next").style.display = "";
            }
        }else if(final){
            resultInfoElem.innerHTML = "Sorry.. no books found for: \"" + removeHtml(final) + "\" in this field..";
            pages.style.display = "none";
        }else{
            resultInfoElem.innerHTML = "Please examine your search query again.. seems like something went wrong..";
            pages.style.display = "none";
        }
    },[data, final]);

    //runs on the first render & any time the dependency values change
    useEffect(() => {
        if(data && data.length !== 0){
            getResultMessage();
        }
    },[data, getResultMessage, searchByOption, sortByOption]);


    function search2(event){
        if(event.key === "Enter"){
            search();
        }        
    }

    const handlePages = (event) =>{
        const p = document.getElementById("prev");
        const n = document.getElementById("next");
        let id = event.target.id;
        console.log(id)

        if(id === "next" || id === "nextIcon"){
            p.style.display = "";
            if(data && (data.slice(min+10,max+10).length !== 0)){
                if(page < 4){
                    setMin(min+10);
                    setMax(max+10);
                    setPage(page+1);
                    //values can only change with set and they actually get updated once the render happens
                    if(page === 3 || (data.slice(min+10,max+10).length < 10)){
                        n.style.display = "none";
                    }
                }
            }else{
                n.style.display = "none";
            }
        }else if(id === "prev" || id === "prevIcon"){
            n.style.display = "";
            if(page > 1){
                setMin(min-10);
                setMax(max-10);
                setPage(page-1);
            
                if(page === 2)
                    p.style.display ="none";
            }
        }
    }   

    return (
        <>
            <div className="searchBarContainer">
                <div className="searchBar">
                    <input type="text" id="searchInput" placeholder={"Type a book title or an author's name.."} onChange={(event) => {setInputValue(event.target.value);}} onKeyUp={search2}></input>
                    <Popup trigger={<button><RiEqualizerLine id="filterIcon"/></button>} position="bottom center">
                        <Filter search={(searchBy) => setSearchByOption(searchBy)} sort={(sortBy) => setSortByOption(sortBy)} callbackProp={search} s1={searchByOption} s2={sortByOption}/> 
                    </Popup>
                    <button onClick={search}><GoSearch id="searchIcon" /></button>
                                   
                </div>
                <div className="results">
                    <h2 id="resultInfo"> </h2>
                    <ul className="bookComponents">
                        {data ? data.slice(min,max).map(item => (
                            <Books key={item.etag} info={item} i={i++}/>
                        )) : getResultMessage()}
                        {console.log(data)}
                    </ul>
                    <div id="pages" style={{display: "none"}}>
                        <button onClick={handlePages} className="btns" id="prev" style={{display: "none"}}><GrLinkPrevious id="prevIcon" /></button>
                        <span id="pg">{page}</span>
                        <button onClick={handlePages} className="btns" id="next"><GrLinkNext id="nextIcon" /></button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Content;