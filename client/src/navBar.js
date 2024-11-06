import React from "react";
import { IoLibrary } from "react-icons/io5";

function NavBar() {

    return (
        <>
        <div className="header">
            <h1><IoLibrary /> Book Search Engine</h1>
            <p>Look up information about any book/author etc</p>
        </div>
        <div className="topnav">
            <a href="#home">Home</a>
            <a href="#books">Books</a>
            <a href="#authors">Authors</a>
            <a href="#footer" style={{float:"right"}}>Contact</a>
        </div>
        </>
    );
}

export default NavBar;