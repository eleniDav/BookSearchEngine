import React, { useCallback, useEffect, useState } from "react";
import { GoSearch } from 'react-icons/go';
import { RiEqualizerLine } from "react-icons/ri";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import Books from './books';
import Filter from './filter';
import Popup from 'reactjs-popup';
import 'dotenv/config'; 
import { stemmer } from 'stemmer';

function Content(){
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [final, setFinal] = useState("");
    const [stopwords, setStopwords] = useState([]);

    //default filter values
    const [searchByOption, setSearchByOption] = useState("intitle:");
    const [sortByOption, setSortByOption] = useState("relevance");
    const [resultsPerPage, setResultsPerPage] = useState(6);

    //for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rsp, setRSP] = useState(6);
    const lastIndex = currentPage * rsp; //last result index in every page
    const firstIndex = lastIndex - rsp; //first result index in every page
    let numOfPages = 0;
    if(data){
        numOfPages = Math.ceil(data.length / rsp);
    }
    //... is a spread operator that takes an iterable(array) and expands it into individual elements
    const numbersInPaginationComp = [...Array(numOfPages + 1).keys()].slice(1); //to show the number defining each page basically px 1 to 5

    //store api key as an environment variable - can be seen only with REACT_APP as prefix
    const key = process.env.REACT_APP_API_KEY;  

    //set the stopwords from txt file(source:nltk library) to a local array - will be executed only once on the first render
    useEffect(() =>{
        fetch("stopwords.txt")
        .then(res => res.text())
        .then((stoppers) => {
            setStopwords(stoppers.split(/\r?\n/));
        })
        .catch(err => console.error("error= " + err));
    },[]);

    //STEP 1 of text preprocessing (no stemming yet-wanna use the unstemmed for the search query)
    function queryPrep(str){   
        //lowercase
        let lower = str.toLowerCase();

        //remove html tags completely
        let firstofall = removeHtml(lower);

        //replace accented chars with ascii ones - decomposing char and accent and then ignoring all accents
        let remAccents = firstofall.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        //remove special characters,non-whitespace,non-alphanumeric characters,emojis/emoticons etc (keeping ')
        let readySentence = remAccents.replace(/[^a-zA-Zα-ωΑ-Ω\d\s']/g, '');
        
        //tokenization - split when you see at least one whitespace character
        let tokens = readySentence.split(/\s+/);

        //remove any empty tokens
        let tokens2 = tokens.filter(t => t !== '');

        //stop-word removal (from nltk library) - handles contractions too
        let cleaned = stopWordRemoval(tokens2);

        //remove ' (in case some made the cut)
        let c = remApostrophes(cleaned);

        return c;
    }

    //STEP 2 stemming on the input and data (NOT on the input that will be included in the request-den dinei kala results)
    function textPrep(str){   
        //stemming - Porter Stemmer
        let stemmed = [];
        for(let i=0;i<str.length;i++){
            stemmed.push(stemmer(str[i]));
        }
        console.log(stemmed);

        return stemmed;
    }

    function remApostrophes(d){
        let r = [];
        let n;
        for(let i=0;i<d.length;i++){
            n = d[i].replace(/'+/g,'');
            r.push(n);
        }
        return r;
    }

    function removeHtml(str){
        return str.replace(/<[^>]*>/g,'');
    }

    function stopWordRemoval(tokenArray){
        let r = [];
        for(let i=0;i<tokenArray.length;i++){
            if(!stopwords.includes(tokenArray[i])){
                r.push(tokenArray[i]);
            }
        }
        return r;
    }

    function search(){
        //initialize current page with every new search
        setCurrentPage(1);
        //for pagination
        setRSP(resultsPerPage);

        let q = queryPrep(inputValue);

        try {
            if (q && q.length > 0) {
                //asynchronous call to API
                fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${q}&orderBy=${sortByOption}&maxResults=40&key=${key}`)
                    .then(response => response.json())
                    .then(console.log(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${q}&orderBy=${sortByOption}&maxResults=40&key=${key}`))
                    .then(data => {setData(data.items); preprocessing(data.items)})
                    .then(setFinal(inputValue))
                    .catch(err => console.error('error fetching data:', err));
            } else {
                setFinal(inputValue);
                setData([]);
                getResultMessage();
            }
        } catch (error) {
            console.log("error = " + error);
        }
    }

    //nlp gia to searchby pedio antistoixa
    function preprocessing(dt){
        if(dt){
            //to request ginetai ws pros to epilegmeno pedio(request param) kai edw filtraro ta responses ws pros to idio pedio gia even better results & gia thn epilogh description
            let workField = "";
            let field = searchByOption;
            console.log(field);
            
            let processed = [];
            let indexer = [];
            for (let i = 0; i < dt.length; i++) {
                switch (field){
                    case 'intitle:' : workField = dt[i].volumeInfo.title;
                    break;
                    case 'inauthor:' : workField = dt[i].volumeInfo.authors ? [...dt[i].volumeInfo.authors].join(", ") : undefined;
                    break;
                    case 'inpublisher:' : workField = dt[i].volumeInfo.publisher;
                    break;
                    case 'subject:' : workField = dt[i].volumeInfo.categories ? [...dt[i].volumeInfo.categories].join(", ") : undefined;
                    break;
                    case 'isbn:' : workField = dt[i].volumeInfo.industryIdentifiers ? [...dt[i].volumeInfo.industryIdentifiers].map(tmp => tmp.identifier).join(", ") : undefined;
                    break;
                    case '' : workField = dt[i].volumeInfo.description ? dt[i].volumeInfo.description : undefined;
                    break;
                    default : workField = dt[i].volumeInfo.title;
                    break;
                }
                console.log(workField);
                if (workField) {
                    let q = queryPrep(workField);
                    processed.push({ 'id': i, 'terms': textPrep(q) });
                    for(let j=0;j<processed[i].terms.length;j++){
                        indexer.push({ 'term': processed[i].terms[j], 'docId': i, });
                        indexer.sort((x,y) => x.term.localeCompare(y.term) || x.docId - y.docId);
                    }
                } else {
                    processed.push({ 'id': i, 'terms': '' });
                }
            }
            console.log(processed);
            console.log(indexer);
            
            return invertedIndex(indexer);   
        }     
    }

    function invertedIndex(index){
        let q = textPrep(queryPrep(inputValue));
        let inverted = [];
        let almostInverted = Object.groupBy(index, ({ term }) => term);
        for(let i=0;i<Object.keys(almostInverted).length;i++){
            //edw kratao mono oses katagrafes exoun terms pou uparxoyn kai sto query mou, ta alla den ta xreiazomai etsi kialliws
            if(q.includes(Object.keys(almostInverted)[i])){
                inverted.push({ 'term': Object.keys(almostInverted)[i], 
                                'docFreq': [...new Set(Object.values(almostInverted)[i].map(item => item.docId))].length, 
                                'postList': [...new Set(Object.values(almostInverted)[i].map(item => item.docId))] });
                                //edw tha breis kai to term frequency otan to xreiasteis
            }
        }
        
        console.log(almostInverted);
        console.log(inverted);

        if(inverted && inverted.length > 0){
            //tajinomo me bash thn suxnothta emfanishs twn orwn se biblia - gia beltistopoihsh ths efarmoghs ths sugxwneushs
            inverted.sort((x,y) => x.docFreq - y.docFreq);

            let tmp = inverted[0].postList;
            for(let i=2;i<inverted.length+1;i++){
                tmp = intersect(tmp,inverted[i-1].postList); 
            }
            //etoimo gia rank
            console.log(tmp);
        }

        return inverted;
    }

    //books that contain ALL the query tokens basically (san logiko kai)
    function intersect(plist1, plist2){
        let p1=0, p2=0;

        let answer = [];
        while(plist1[p1] !== undefined && plist2[p2] !== undefined){
            if(plist1[p1] === plist2[p2]){
                answer.push(plist1[p1]);
                p1 += 1;
                p2 += 1;
            }else if(plist1[p1] < plist2[p2]){
                p1 += 1;
            }else{
                p2 += 1;
            }
        }
        return answer;
    }

    const countResults = useCallback(() => {
        let count = 0;
        if(currentPage < numbersInPaginationComp.length){
            count = rsp;
        }else{
            count = data.length - rsp*(currentPage-1);
        }
        return count;
    },[currentPage, numbersInPaginationComp, rsp, data]);


    //useCallback hook so function wont automatically run on every render (and affect our useEffect) - it will run only when its dependencies update
    const getResultMessage = useCallback(() => {
        const resultInfoElem = document.getElementById("resultInfo");
        const navBar = document.getElementById("pagesContainer");
        if(data && data.length !== 0 && final){
            resultInfoElem.innerHTML = "Results for: \"" + removeHtml(final) + "\" - " + countResults() + "/" + data.length + " books returned";
            navBar.style.display = "block";
        }else if(final){
            resultInfoElem.innerHTML = "Sorry.. no books found for: \"" + removeHtml(final) + "\" in this field..";
            navBar.style.display = "none";
        }else{
            resultInfoElem.innerHTML = "";
            navBar.style.display = "none";
        }
    },[final, data, countResults]);

    //runs on every render (no double clicks - waiting for state changes after render)
    useEffect(() => {
        getResultMessage();
    }, [getResultMessage]);


    function search2(event){
        if(event.key === "Enter"){
            search();
        }        
    }

    function prevPage(){
        if(currentPage > 1)
            setCurrentPage(currentPage - 1);
    }

    function nextPage(){
        if(currentPage < numOfPages)
            setCurrentPage(currentPage + 1);
    }

    function goToPage(pg){
        setCurrentPage(pg);
    }    

    return (
        <>
            <div className="searchBarContainer">
                <div className="searchBar">
                    <input type="text" id="searchInput" placeholder={"Type a book title or an author's name.."} onChange={(event) => {setInputValue(event.target.value);}} onKeyUp={search2}></input>
                    <Popup trigger={<button><RiEqualizerLine id="filterIcon"/></button>} position="bottom center">
                        <Filter search={(searchBy) => setSearchByOption(searchBy)} sort={(sortBy) => setSortByOption(sortBy)} rCount={(resultCount) => setResultsPerPage(resultCount)} r={resultsPerPage} s1={searchByOption} s2={sortByOption}/> 
                    </Popup>
                    <button onClick={search}><GoSearch id="searchIcon" /></button>
                                   
                </div>
                <div className="results">
                    <h2 id="resultInfo"> </h2>
                    <ul className="bookComponents">
                        {data ? data.slice(firstIndex,lastIndex).map(item => (
                            <Books key={item.etag} info={item}/>
                        )) : getResultMessage()}
                        {console.log(data)}
                    </ul>
                    <nav id="pagesContainer" style={{display: "none"}}>
                        <ul className="pages">
                            <li>
                                <button onClick={prevPage} className="navBtns" id="prev"><GrLinkPrevious id="prevIcon" /></button>
                            </li>
                            {numbersInPaginationComp.map((n, i) => (
                                <li key={i}>
                                    <button onClick={() => goToPage(n)} className={`btns${currentPage === n ? "_active" : ""}`}>{n}</button>
                                </li>
                            ))}
                            <li>
                                <button onClick={nextPage} className="navBtns" id="next"><GrLinkNext id="nextIcon" /></button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}

export default Content;