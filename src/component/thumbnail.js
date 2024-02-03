import React from "react";
import { useState } from "react";

function Thumbnail({thumbnail_url, user_name}) {
    const [loading, setLoading] = useState(true);

    return (
        <div>
            {loading && <div className="card-img-top rounded bg-black " style={{ height: "166.5px"}}></div>}
            <img src={thumbnail_url} className={`card-img-top rounded ${loading ? 'position-absolute top-0 start-0':''}`} alt={user_name} onLoad={()=>{setLoading(false)}}/>
        </div>
    );
    
}

export default Thumbnail;