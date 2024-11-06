import React from "react";

function Books() {

  return (
    <>

        <div className="bookContainer">
            <div className="bookInfo1">
                <img src="icon.png" alt="no pic for u"></img>
                <div className="info_1">
                    <p>title</p>
                    <p>authors</p>
                    <p>whatever else you want</p>
                </div>
                <button id="moreInfo">More details</button>
            </div>
            <div className="bookInfo2">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ac laoreet neque. Aliquam non iaculis ipsum. Pellentesque ultricies mauris vitae nunc porta pharetra. Morbi ut tellus dictum, imperdiet turpis ac, tristique neque. Praesent auctor ex sapien, ut vestibulum risus aliquet vel. Aenean sodales ac ex et fringilla. Proin sed iaculis erat, ut accumsan urna.</p>
            </div>
            
        </div>

    </>
  )

}

export default Books;