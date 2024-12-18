import React, { useCallback, useEffect, useState } from "react";
import { GoSearch } from 'react-icons/go';
import { RiEqualizerLine } from "react-icons/ri";
import { GrLinkNext, GrLinkPrevious } from "react-icons/gr";
import Books from './books';
import Filter from './filter';
import Popup from 'reactjs-popup';
import 'dotenv/config'; 

function Content(){
    const [data, setData] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [final, setFinal] = useState("");
    const [stopwords, setStopwords] = useState([]);

    //default filter values
    const [searchByOption, setSearchByOption] = useState("");
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

    //query preparation
    function queryPrep(smth){   
        //parsing     
        let query = smth;
        //console.log(query);

        //lowercase
        let lower = query.toLowerCase();

        //remove html tags completely
        let firstofall = removeHtml(lower);
        
        //remove special characters,non-whitespace,non-alphanumeric characters,emojis/emoticons etc (keeping ')
        let readySentence = firstofall.replace(/[^a-zA-Z\d\s']/g, '');
        
        //tokenization - split when you see at least one whitespace character
        let tokens = readySentence.split(/\s+/);

        //remove any empty tokens
        let tokens2 = tokens.filter(t => t !== '');

        //stop-word removal (from nltk library) - handles contractions too (MUST BE LAST STEP)
        let cleaned = stopWordRemoval(tokens2);

        //remove ' as well (in case some made the cut)
        let c = remApostrophes(cleaned);

        //stemming - Porter Stemmer
        let stemmed = [];
        for(let i=0;i<c.length;i++){
            stemmed.push(stemmer(c[i]));
        }
        
        //george ela,  U.S.A  PALi to ka-lo to don't prm's ,nai pali? 12dog nai       ..... pali ..ta idia t<html> idia.
        //the dog walked at the beautiful park outside roaming the prettily decorated streets
        
        //console.log(c);

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
        for(let i=0;i<tokenArray.length;i++)
            if(!stopwords.includes(tokenArray[i]))
                r.push(tokenArray[i]);
        return r;
    }

    let stemmer = (function(){
        let step2list = {
                "ational" : "ate",
                "tional" : "tion",
                "enci" : "ence",
                "anci" : "ance",
                "izer" : "ize",
                "bli" : "ble",
                "alli" : "al",
                "entli" : "ent",
                "eli" : "e",
                "ousli" : "ous",
                "ization" : "ize",
                "ation" : "ate",
                "ator" : "ate",
                "alism" : "al",
                "iveness" : "ive",
                "fulness" : "ful",
                "ousness" : "ous",
                "aliti" : "al",
                "iviti" : "ive",
                "biliti" : "ble",
                "logi" : "log"
            },
    
            step3list = {
                "icate" : "ic",
                "ative" : "",
                "alize" : "al",
                "iciti" : "ic",
                "ical" : "ic",
                "ful" : "",
                "ness" : ""
            },
    
            c = "[^aeiou]",          // consonant
            v = "[aeiouy]",          // vowel
            C = c + "[^aeiouy]*",    // consonant sequence
            V = v + "[aeiou]*",      // vowel sequence
    
            mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
            meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
            mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
            s_v = "^(" + C + ")?" + v;                   // vowel in stem
    
        return function (w) {
            let 	stem,
                suffix,
                firstch,
                re,
                re2,
                re3,
                re4;
    
            if (w.length < 3) { return w; }
    
            firstch = w.substr(0,1);
            if (firstch === "y") {
                w = firstch.toUpperCase() + w.substr(1);
            }
    
            // Step 1a
            re = /^(.+?)(ss|i)es$/;
            re2 = /^(.+?)([^s])s$/;
    
            if (re.test(w)) { w = w.replace(re,"$1$2"); }
            else if (re2.test(w)) {	w = w.replace(re2,"$1$2"); }
    
            // Step 1b
            re = /^(.+?)eed$/;
            re2 = /^(.+?)(ed|ing)$/;
            if (re.test(w)) {
                let fp = re.exec(w);
                re = new RegExp(mgr0);
                if (re.test(fp[1])) {
                    re = /.$/;
                    w = w.replace(re,"");
                }
            } else if (re2.test(w)) {
                let fp = re2.exec(w);
                stem = fp[1];
                re2 = new RegExp(s_v);
                if (re2.test(stem)) {
                    w = stem;
                    re2 = /(at|bl|iz)$/;
                    re3 = new RegExp("([^aeiouylsz])\\1$");
                    re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                    if (re2.test(w)) {	w = w + "e"; }
                    else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
                    else if (re4.test(w)) { w = w + "e"; }
                }
            }
    
            // Step 1c
            re = /^(.+?)y$/;
            if (re.test(w)) {
                let fp = re.exec(w);
                stem = fp[1];
                re = new RegExp(s_v);
                if (re.test(stem)) { w = stem + "i"; }
            }
    
            // Step 2
            re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
            if (re.test(w)) {
                let fp = re.exec(w);
                stem = fp[1];
                suffix = fp[2];
                re = new RegExp(mgr0);
                if (re.test(stem)) {
                    w = stem + step2list[suffix];
                }
            }
    
            // Step 3
            re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
            if (re.test(w)) {
                let fp = re.exec(w);
                stem = fp[1];
                suffix = fp[2];
                re = new RegExp(mgr0);
                if (re.test(stem)) {
                    w = stem + step3list[suffix];
                }
            }
    
            // Step 4
            re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
            re2 = /^(.+?)(s|t)(ion)$/;
            if (re.test(w)) {
                let fp = re.exec(w);
                stem = fp[1];
                re = new RegExp(mgr1);
                if (re.test(stem)) {
                    w = stem;
                }
            } else if (re2.test(w)) {
                let fp = re2.exec(w);
                stem = fp[1] + fp[2];
                re2 = new RegExp(mgr1);
                if (re2.test(stem)) {
                    w = stem;
                }
            }
    
            // Step 5
            re = /^(.+?)e$/;
            if (re.test(w)) {
                let fp = re.exec(w);
                stem = fp[1];
                re = new RegExp(mgr1);
                re2 = new RegExp(meq1);
                re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                    w = stem;
                }
            }
    
            re = /ll$/;
            re2 = new RegExp(mgr1);
            if (re.test(w) && re2.test(w)) {
                re = /.$/;
                w = w.replace(re,"");
            }
    
            // and turn initial Y back to y
    
            if (firstch === "y") {
                w = firstch.toLowerCase() + w.substr(1);
            }
    
            return w;
        }
    })();

    function search(){
        //initialize current page with every new search
        setCurrentPage(1);
        //for pagination
        setRSP(resultsPerPage);

        try {
            if (queryPrep(inputValue) && queryPrep(inputValue).length > 0) {
                //asynchronous call to API
                fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${queryPrep(inputValue)}&orderBy=${sortByOption}&maxResults=40&key=${key}`)
                    .then(response => response.json())
                    .then(console.log(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${queryPrep(inputValue)}&orderBy=${sortByOption}&maxResults=40&key=${key}`))
                    .then(data => setData(data.items))
                    .then(preprocessing(data)) //acts on double click cause data hasnt updated yet(asynchronous)
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

    //kanw nlp gia tous titlous arxika (1o bhma)
    function preprocessing(dt){
        let processed = [];
        let indexer = [];
        for (let i = 0; i < dt.length; i++) {
            if (dt[i].volumeInfo.title) {
                processed.push({ 'id': i, 'terms': queryPrep(dt[i].volumeInfo.title) });
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

    function invertedIndex(index){
        let inverted = [];
        let almostInverted = Object.groupBy(index, ({ term }) => term);
        for(let i=0;i<Object.keys(almostInverted).length;i++){
            //edw kratao mono oses katagrafes exoun terms pou uparxoyn kai sto query mou, ta alla den ta xreiazomai etsi kialliws
            if(queryPrep(inputValue).includes(Object.keys(almostInverted)[i])){
                inverted.push({ 'term': Object.keys(almostInverted)[i], 'freq': Object.values(almostInverted)[i].length, 'postList': Object.values(almostInverted)[i].map(item => item.docId)});
            }
        }
        
        console.log(almostInverted);
        console.log(inverted);

        return inverted;
    }

    //useCallback hook so function wont automatically run on every render (and affect our useEffect) - it will run only when its dependencies update
    const getResultMessage = useCallback(() => {
        const resultInfoElem = document.getElementById("resultInfo");
        const navBar = document.getElementById("pagesContainer");
        if(data && data.length !== 0 && final){
            resultInfoElem.innerHTML = "Results for: \"" + removeHtml(final) + "\" - " + rsp + "/" + data.length + " books returned";
            navBar.style.display = "block";
        }else if(final){
            resultInfoElem.innerHTML = "Sorry.. no books found for: \"" + removeHtml(final) + "\" in this field..";
            navBar.style.display = "none";
        }else{
            resultInfoElem.innerHTML = "";
            navBar.style.display = "none";
        }
    },[final, data, rsp]);

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