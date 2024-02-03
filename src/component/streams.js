import React, { useState, useEffect, useRef } from 'react';
import Thumbnail from './thumbnail';
import KakaoAdFit from './kakaoAdfit';

function Streams({streams, loading, setLoading}) {
    const [showOverlay, setShowOverlay] = useState(null);
    const [overIcon, setOverIcon] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timer); // 컴포넌트 unmount 시 타이머 해제
    }, [, loading]);


    const clickEevet = (url) => {
        // 새창 띄우기
        window.open(url, '_blank');
    };


    const Overlay = ({platform, url}) => {
        return (
            <div className='position-absolute top-0 start-0 w-100 h-100 rounded'
                style={{backgroundColor: "rgba(0,0,0,0.7)"}}
                onMouseLeave={(e)=>{e.stopPropagation(); setShowOverlay(null)}}
                >
                <div className='d-flex align-items-center h-100'>
                    {platform.map((p, index) => (
                        <div className={`h-100 ${platform.length > 1 ? 'w-50':'w-100'} d-flex justify-content-center align-items-center`}
                            style={{cursor:"pointer"}}
                            onClick={(e)=>{e.stopPropagation(); clickEevet(url[p]);}}
                            onMouseEnter={(e)=>{e.stopPropagation(); setOverIcon(p)}}>
                            <img className={`opacity-${overIcon === p?"100":"50"}`} src={`/${p}.png`} alt={p} width='50px' height='50px'/>
                        </div>
                    ))}
                    {/* {platform.includes('twitch') && 
                        <div className={`h-100 ${platform.length > 1 ? 'w-50':'w-100'} d-flex justify-content-center align-items-center`}
                            style={{cursor:"pointer"}}
                            onClick={(e)=>{e.stopPropagation(); clickEevet(url[count]); setCount(count+1);}}
                            onMouseEnter={(e)=>{e.stopPropagation(); setOverIcon("twitch")}}>
                            <img className={`opacity-${overIcon === "twitch"?"100":"50"}`} src='/twitch.png' alt='twitch' width='50px' height='50px'/>
                        </div>
                    }
                    {platform.includes('chzzk') && 
                        <div className={`h-100 ${platform.length > 1 ? 'w-50':'w-100'} d-flex justify-content-center align-items-center`}
                            style={{cursor:"pointer"}}
                            onClick={(e)=>{e.stopPropagation(); clickEevet(url[count]); setCount(count+1);}}
                            onMouseEnter={(e)=>{e.stopPropagation(); setOverIcon("chzzk")}}>
                            <img className={`opacity-${overIcon === "chzzk"?"100":"50"}`} src='/chzzk.png' alt='chzzk' width='50px' height='50px'/>
                        </div>
                    } */}
                </div>
            </div>
        );
    };
    

    if (streams.length === 0 ){
        if(loading) {
            return (
                <div className='mt-5 d-flex justify-content-center' style={{height: "100vh"}}>
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }
        else {
            return (
            <div className='mt-5 d-flex justify-content-center text-white' style={{height: "100vh"}}>
                <div>데이터가 없는 것 같아요..</div>
            </div>
            );
        }
    }
    else {
        return (
            <>
                <div className='col mb-3' style={{width: "320px"}}>
                    <KakaoAdFit unit={"DAN-fFmXrhjM6LsWQBBz"} width={"300"} height={"250"} disabled={false}/>
                </div>
                {streams.map(stream => (
                    <div key={stream.id} className='col mb-3' style={{width: "320px"}}>
                        
                        <div class="card border-0 bg-dark">
                            <div className='position-relative rounded' onMouseEnter={(e)=>{e.stopPropagation(); setShowOverlay(stream.id)}}>
                                {stream.thumbnail_url ? (
                                    <Thumbnail thumbnail_url={stream.thumbnail_url} user_name={stream.user_name}/>
                                ) : (
                                    <div className="card-img-top rounded bg-black" style={{ height: "166.5px" }}></div>
                                )}
                                <div className='position-absolute top-0 start-0 m-2'>
                                    <div className='d-flex align-items-center'>
                                        <div className='p-1 text-bg-danger rounded fw-bold' style={{fontSize: "12px"}}>
                                            LIVE
                                        </div>
                                        {stream.viewer_count > 0 &&(
                                        <div className='p-1 bg-dark rounded ms-1 text-light' style={{fontSize: "12px"}}>
                                            {stream.viewer_count.toLocaleString()} 시청
                                        </div>
                                        )}
                                    </div>
                                </div>
                                <div className='position-absolute top-0 end-0 m-2'>
                                    {stream.platform.includes('twitch') && <img className='ms-1' src='/twitch.png' alt='twitch' width='20px' height='20px'/>}
                                    {stream.platform.includes('chzzk') && <img className='ms-1' src='/chzzk.png' alt='twitch' width='20px' height='20px'/>}
                                </div>
                                {stream.id === showOverlay && (<Overlay platform={stream.platform} url={stream.url}/>)}
                            </div>
                            
                            <div class="card-body text-light p-2 ps-0" style={{fontSize:"12px"}}>
                                <div className='d-flex'>
                                    {stream.profile_image_url && (
                                        <div>
                                            <img className='rounded-pill' src={stream.profile_image_url} alt={stream.user_name} width='40px' height='40px'/>
                                        </div>
                                    )}
                                    <div className='ms-2'>
                                        <p className='m-0 fw-bold'>{stream.title}</p>
                                        <p className='m-0 text-white-50'>{stream.user_name}</p>
                                        <p className='m-0 text-white-50'>{stream.game_name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </>
        )
    }
}

export default Streams;