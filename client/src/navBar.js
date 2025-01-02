import React from "react";
import { IoLibrary } from "react-icons/io5";
import { Link } from "react-router-dom";

function NavBar() {

    return (
        <>
        <div className="header">
            <Link to="/"><span className="header_title"><IoLibrary /> Bookie <IoLibrary /></span></Link>
            <span className="header_sub">Discover new books, look up your favorite authors and publishers and get lost in the world of literature that the Bookie Search Engine has to offer!</span>
        </div>
        <div className="topnav">
            <Link to="/">Home</Link>
            <Link to="/api">Books</Link>
            <Link to="/about">About</Link>
            <a href="mailto:elenidav19@yahoo.com" style={{float:"right"}}>Contact</a>
        </div>
        </>
    );
}

export default NavBar;