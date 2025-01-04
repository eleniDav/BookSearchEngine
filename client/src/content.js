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
    const [inputValue, setInputValue] = useState("");
    const [final, setFinal] = useState("");
    const [stopwords, setStopwords] = useState([]);

    const [rankedData, setRankedData] = useState([]);

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
    if(rankedData){
        numOfPages = Math.ceil(rankedData.length / rsp);
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

    //to handle AND & OR
    let andFound = 0;
    let orFound = 0;

    //processing of the input query that will be included in the request
    function reqInputPrep(str){   
        //remove possible html tags
        let firstofall = removeHtml(str);

        //handling logical operators (very basic) 
        let secondofall = firstofall.replace(/(\b && |\band )/g, ' AND ').replace(/(\b \|\| |\bor )/g, ' OR ').replace(/(\bnot |\bNOT | !)/g, ' -');
        let thirdofall = secondofall.replace(/["&!|#$%()+,./:;<=>@^_`{}~]/g, '');

        //tokenization - split when you see at least one whitespace character
        let tokens = thirdofall.split(/\s+/);

        //remove any empty tokens
        let tokens2 = tokens.filter(t => t !== '');

        if(tokens2.includes("AND")){
            andFound = 1;
        }else if(tokens2.includes("OR")){
            orFound = 1;
        }

        //stop-word removal (from nltk library) - handles contractions too
        let cleaned = stopWordRemoval(tokens2);

        let readyforsearch = cleaned.join("+");
        
        let notHandleBegin = "";
        if(readyforsearch[0] === "-"){
            notHandleBegin = readyforsearch.replace(/^-/, '%20+-'); 
        }
        else{
            notHandleBegin = readyforsearch;
        }

        console.log(notHandleBegin);

        return notHandleBegin;
    }

    //text preprocessing (for input text and data of the epilegmeno field only(to make matches), DIFFERENT PROCESS FROM THE REQUEST QUERY)
    function textPrep(str){   
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

        //stemming - Porter Stemmer
        let stemmed = [];
        for(let i=0;i<c.length;i++){
            stemmed.push(stemmer(c[i]));
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
        //initialize current page to the first one with every new search
        setCurrentPage(1);
        //for pagination
        setRSP(resultsPerPage);

        let q = reqInputPrep(inputValue);
        const allTheData = [];
        const apiCalls = [];

        try {
            if (q && q.length > 0) {
                //combine the results of many asynchronous calls to the API (to get more than 40 results)
                //4 calls with 40 results each = 160 total results (max)
                for(let sCount=0;sCount<150;sCount+=40){
                    apiCalls.push(`https://www.googleapis.com/books/v1/volumes?q=${searchByOption}${q}&startIndex=${sCount}&maxResults=40&key=${key}`);
                }
                //array of fetch promises
                const fetchPromises = apiCalls.map(apiCall => fetch(apiCall));

                //fetch the data from all the calls, combine & use them
                Promise.all(fetchPromises)
                    .then(responses => Promise.all(responses.map(response => response.json())))
                    .then(dt => {
                        if(dt.length > 0 ){
                            dt.forEach(function(d){
                                if(d.items){
                                    allTheData.push(...d.items);
                                }
                            });            
                            console.log(allTheData);
                            ranking(allTheData);
                        }else{
                            setRankedData([]);
                            getResultMessage();
                        }
                    })
                    .then(setFinal(inputValue))
                    .catch(err => console.error('error fetching data:', err));                
            } else {
                setFinal(inputValue);
                setRankedData([]);
                getResultMessage();
            }
        } catch (error) {
            console.log("error = " + error);
        }
    }

    function ranking(dt) {
        if (dt) {
            //api default sorting => relevancy

            let results = preprocessing(dt);
            let toBeRanked = [];
            let secondaryResults = results[1];
            let topResults = results[0];

            //tajinomhsh me bash thn suxnothta emfanishs twn orwn sto epilegmeno pedio
            if (sortByOption === "relevance") {
                if(andFound === 1){
                    for (let i = 0; i < dt.length; i++) {
                        //an brw and tote emfanish mono autwn me olous tous orous sto antistoixo pedio - (logiko and)
                        if (topResults.includes(i)) {
                            toBeRanked.push(dt[i]);
                        }
                    }
                    setRankedData(toBeRanked);
                    console.log(toBeRanked);
                }else if(orFound === 1){
                    for (let i = 0; i < dt.length; i++) {
                        //an brw or tote emfanish mono autwn me toulaxiston enan aptous orous sto antistoixo pedio - (logiko or)
                        if (secondaryResults.includes(i)) {
                            toBeRanked.push(dt[i]);
                        }
                    }
                    setRankedData(toBeRanked);
                    console.log(toBeRanked);
                }else{
                    //default activity
                    //ola arxika tha exoun rank 5 
                    /*  auta pou menoun me to 5 den periexoun kanenan apo tous orous sto epilegmeno pedio (san logiko not)
                        mporei px (pedio:title)na periexoun enan aptous orous sto subtitle kai giauto na epistrafhkan h (pedio:description)
                        na exoun epistrafei gt enas aptous orous brisketai sto title h to eswteriko tou bibliou(gt einai to default request pou psaxnei titlo kai content)
                        alla oxi sto description */
                    for (let i = 0; i < dt.length; i++) {
                        toBeRanked.push({ "rank": 5, "dt": dt[i] });

                        //osa exoun toulaxiston 1 apo tous orous tou query tha exoun rank=2 (logiko or)
                        if (secondaryResults.includes(i)) {
                            toBeRanked[i].rank = 2;
                        }

                        //rank=1 gia ta books pou periexoun sto antistoixo pedio pou exei epilexthei OLOUS tous orous tou query - top results - (logiko and)
                        if (topResults.includes(i)) {
                            toBeRanked[i].rank = 1;
                        }
                    }

                    toBeRanked.sort((x, y) => x.rank - y.rank);
                    setRankedData(toBeRanked.map(item => item.dt));
                    console.log(toBeRanked);
                }
            }
            //tajinomhsh me bash thn hmeromhnia ekdoshs
            //filtro pano sta idia 40 most relevant pou epistrefontai apo default - so not THE most recent, just the most recent out of these 40 results
            else if (sortByOption === "newest") { 
                if(andFound === 1){
                    for (let i = 0; i < dt.length; i++) {
                        //an brw and tote emfanish mono autwn me olous tous orous sto antistoixo pedio - (logiko and)
                        if (topResults.includes(i)) {
                            toBeRanked.push(dt[i]);
                        }
                    }
                }else if(orFound === 1){
                    for (let i = 0; i < dt.length; i++) {
                        //an brw or tote emfanish mono autwn me toulaxiston enan aptous orous sto antistoixo pedio - (logiko or)
                        if (secondaryResults.includes(i)) {
                            toBeRanked.push(dt[i]);
                        }
                    }
                }else{
                    toBeRanked = dt;
                }
                
                toBeRanked.sort(function(x, y) {
                    //books with no publish date -> ranked at the bottom
                    if(x.volumeInfo.publishedDate === undefined){
                        return 1;
                    }
                    if(y.volumeInfo.publishedDate === undefined){
                        return -1;
                    }
                    
                    //compare them as strings
                    x = x.volumeInfo.publishedDate.split('-').join(''); 
                    y = y.volumeInfo.publishedDate.split('-').join(''); 

                    //prwta ta most recent - descending order (1->prwto auto apo dejia tou telesth -1->prwto auto apo aristera tou telesth 0->idia tajinomhsh)
                    return x < y ? 1 : x > y ? -1 : 0;
                });

                setRankedData(toBeRanked);
                console.log(toBeRanked);
            }
        }else {
            setRankedData([]);
            getResultMessage();
        }
    }

    //nlp gia to searchby pedio antistoixa
    function preprocessing(dt) {
        if (dt) {
            //to request ginetai ws pros to epilegmeno pedio(request param) kai edw filtraro ta responses ws pros to idio pedio gia even better results & gia thn epilogh description
            let workField = "";
            let field = searchByOption;
            console.log(field);

            let processed = [];
            let indexer = [];
            for (let i = 0; i < dt.length; i++) {
                switch (field) {
                    case 'intitle:': workField = dt[i].volumeInfo.title;
                        break;
                    case 'inauthor:': workField = dt[i].volumeInfo.authors ? [...dt[i].volumeInfo.authors].join(", ") : undefined;
                        break;
                    case 'inpublisher:': workField = dt[i].volumeInfo.publisher ? dt[i].volumeInfo.publisher : undefined;
                        break;
                    case 'subject:': workField = dt[i].volumeInfo.categories ? [...dt[i].volumeInfo.categories].join(", ") : undefined;
                        break;
                    case 'isbn:': workField = dt[i].volumeInfo.industryIdentifiers ? [...dt[i].volumeInfo.industryIdentifiers].map(tmp => tmp.identifier).join(", ") : undefined;
                        break;
                    case '': workField = dt[i].volumeInfo.description ? dt[i].volumeInfo.description : undefined;
                        break;
                    default: workField = dt[i].volumeInfo.title;
                        break;
                }
                console.log(workField);
                if (workField) {
                    processed.push({ 'id': i, 'terms': textPrep(workField) });
                    for (let j = 0; j < processed[i].terms.length; j++) {
                        indexer.push({ 'term': processed[i].terms[j], 'docId': i, });
                    }
                    indexer.sort((x, y) => x.term.localeCompare(y.term) || x.docId - y.docId);
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
        let q = textPrep(inputValue);
        let inverted = [];
        let tmp = [];
        let tmp2 = [];

        let inversionPrep = [];
        //edw kratao mono oses katagrafes exoun terms pou uparxoyn kai sto query mou, ta alla den ta xreiazomai etsi kialliws -me kathusteroun
        for(let i=0;i<index.length;i++){
            if(q.includes(index[i].term)){
                inversionPrep.push(index[i]);
            }
        }

        let almostInverted = Object.groupBy(inversionPrep, ({ term }) => term);
        for(let i=0;i<Object.keys(almostInverted).length;i++){
            inverted.push({ 'term': Object.keys(almostInverted)[i], 
                            'docFreq': [...new Set(Object.values(almostInverted)[i].map(item => item.docId))].length, 
                            'postList': [...new Set(Object.values(almostInverted)[i].map(item => item.docId))] });
        }
        
        console.log(inversionPrep);
        console.log(almostInverted);
        console.log(inverted);

        if(inverted && inverted.length > 0){
            //tajinomo me bash thn suxnothta emfanishs twn orwn se biblia - gia beltistopoihsh ths efarmoghs ths sugxwneushs
            inverted.sort((x,y) => x.docFreq - y.docFreq);

            tmp = inverted[0].postList;
            tmp2 = inverted[0].postList;
            for(let i=2;i<inverted.length+1;i++){
                tmp = intersect(tmp,inverted[i-1].postList); 
                tmp2 = intersect2(tmp2,inverted[i-1].postList);
            }
            //next step -> rank
            console.log(tmp); //results me olous tous orous
            console.log(tmp2); //results me toulaxiston 1 aptous orous
        }

        return [tmp, tmp2];
    }

    //books that contain ALL the query tokens (logiko and)
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

    //books that contain at least one of the query tokens (logiko or)
    function intersect2(plist1,plist2){
        let answer = plist1.concat(plist2.filter(i => !plist1.some(j => j===i)));
        answer.sort((x,y) => x - y);       
        return answer;
    }

    const countResults = useCallback(() => {
        if(rankedData){
            let count = 0;
            if(currentPage < numbersInPaginationComp.length){
                count = rsp;
            }else{ //sthn teleutaia selida exw < epilegmeno arithmo results per page (sunhthws)
                count = rankedData.length - rsp*(currentPage-1);
            }
            return count;
        }
    },[currentPage, numbersInPaginationComp, rsp, rankedData]);


    //useCallback hook so function wont automatically run on every render (and affect our useEffect) - it will run only when its dependencies update
    const getResultMessage = useCallback(() => {
        const resultInfoElem = document.getElementById("resultInfo");
        const navBar = document.getElementById("pagesContainer");
        if(rankedData && rankedData.length !== 0 && final){
            resultInfoElem.innerHTML = "Results for: \"" + removeHtml(final) + "\" - " + countResults() + "/" + rankedData.length + " books returned";
            navBar.style.display = "block";
        }else if(final){
            resultInfoElem.innerHTML = "Sorry.. no books found for: \"" + removeHtml(final) + "\" in this field..";
            navBar.style.display = "none";
        }else{
            resultInfoElem.innerHTML = "";
            navBar.style.display = "none";
        }
    },[final, rankedData, countResults]);

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
                        {rankedData ? rankedData.slice(firstIndex,lastIndex).map(item => (
                            <Books key={item.etag} info={item}/>
                        )) : getResultMessage()}
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