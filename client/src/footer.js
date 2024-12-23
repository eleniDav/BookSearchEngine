import React from "react";
import "./css/footer.css";
import { IoLibrary } from "react-icons/io5";
import { TiSocialFacebook, TiSocialInstagram } from "react-icons/ti";
import { FaGithub } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { RxDotFilled } from "react-icons/rx";
import { Link } from "react-router-dom";

function Footer() {

    return (
        <>
            <div className="footer">
                <div className="footer_info1">
                    <span className="footer_info1_title"><IoLibrary /> Bookie</span>
                    <span className="footer_info1_main">Explore the world of books with the Bookie Search Engine!</span>
                    <a href="https://www.ihu.gr" target="_blank" rel="noreferrer"><button><FaLocationDot /> International Hellenic University</button></a>
                </div>
                <div className="footer_info2">
                    <Link to="/about">About</Link><RxDotFilled />
                    <Link to="/api">Books</Link><RxDotFilled />
                    <Link to="/">Home</Link>
                </div>
                <div className="footer_info3">
                    <div className="uni">
                        <a href="https://www.iee.ihu.gr" target="_blank" rel="noreferrer"><button className="uni_logo"><img src="uni2.png" alt=""></img></button></a>
                        <span>Department of IT and Electronic Systems Engineering</span>
                    </div>
                    <div className="socials">
                        <a href="https://www.facebook.com/elenaki.davitidou" target="_blank" rel="noreferrer"><button><TiSocialFacebook /></button></a>
                        <a href="https://www.instagram.com/eleni_davitidou" target="_blank" rel="noreferrer"><button><TiSocialInstagram /></button></a>
                        <a href="https://github.com/eleniDav" target="_blank" rel="noreferrer"><button><FaGithub /></button></a>
                        <a href="mailto:elenidav19@yahoo.com"><button><IoMdMail /></button></a>
                    </div>
                </div>                
            </div>
        </>
    );
}

export default Footer;