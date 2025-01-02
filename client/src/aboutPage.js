import React from "react";
import "./css/otherPages.css";

function About() {

    return (
        <>
            <div className="searchBarContainer">
                <div className="otherPagesContainer">
                    <h3 className="header_other">Welcome to the Bookie Search Engine!</h3>
                    <ul className="about_ul">
                        <li><p>Here you can learn more about all your favorite books, authors and publishers and discover new information regarding the book world!</p></li>
                        <li><p>Click on the Home page and simply type in any keyword that could describe a book (title, ISBN code, author etc), apply the proper filters and let the exploring begin!</p></li>
                        <li><p>Make sure to send me your feedback through an email by clicking on the Contact button at the top right of the page!</p></li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default About;