import React, {useState, Fragment} from "react";

function CellsComponent(props) {
    return (
        <div style={{display:"flex", justifyContent:"left"}} 
            dangerouslySetInnerHTML={{ __html: props.svg}}    
        >
        </div>
    );
}

export default CellsComponent
