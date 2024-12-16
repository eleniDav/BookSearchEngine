import React from "react";
import { IoLibrary } from "react-icons/io5";

function NavBar() {

    return (
        <>
        <div className="header">
            <button onClick={() => window.location.reload()}><h1><IoLibrary /> Bookie <IoLibrary /></h1></button>
            <p>Discover new books, look up your favorite authors and publishers and get lost in the world of literature that the Bookie Search Engine has to offer!</p>
        </div>
        <div className="topnav">
            <a href="#home" onClick={() => window.location.reload()}>Home</a>
            <a href="#books">Books</a>
            <a href="#about">About</a>
            <a href="#contact" style={{float:"right"}}>Contact</a>
        </div>
        </>
    );
}

export default NavBar;