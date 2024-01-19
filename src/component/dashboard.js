import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [streamsTW, setStreamsTW] = useState([]);
    const [streamsCZZ, setStreamsCZZ] = useState([]);
    const [addStreams, setAddStreams] = useState([]);
    
    const [showOverlay, setShowOverlay] = useState(null);
    const [overIcon, setOverIcon] = useState(null);
    useEffect(() => {
        const fetchStreams = async () => {
            try {
                
                const response = await axios.get('https://api.twitch.tv/helix/streams', {
                headers: {
                    'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${process.env.REACT_APP_TWITCH_CLIENT_TOKEN}`
                },
                params: {
                    first: 30,
                    language : 'ko'
                }
                });
                const data = [];
                for (const stream of response.data.data) {
                    data.push({
                        id: stream.id,
                        platform: ['twitch'],
                        thumbnail_url: stream.thumbnail_url.replace('{width}','480').replace('{height}','270'),
                        user_name: stream.user_name,
                        user_id: stream.user_id,
                        title: stream.title,
                        game_name: stream.game_name,
                        viewer_count: stream.viewer_count,
                        url: {twitch: "https://www.twitch.tv/" + stream.user_login}
                    });
                }
                
                const responseProfile = await axios.get('https://api.twitch.tv/helix/users', {
                    headers: {
                        'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
                        'Authorization': `Bearer ${process.env.REACT_APP_TWITCH_CLIENT_TOKEN}`
                    },
                    params: {
                        id: data.map(stream => stream.user_id)
                    }
                    });
                for (const stream of data) {
                    for (const profile of responseProfile.data.data) {
                        if (stream.user_id === profile.id) {
                            stream.profile_image_url = profile.profile_image_url;
                            delete stream.user_id;
                        }
                    }
                }
                setStreamsTW(data);
            } catch (error) {
                console.error('Error fetching streams:', error);
                // 에러 처리 로직을 추가하세요.
            }
        };

        const fetchStreamsCzz = async () => {
            try {
                const response = await axios.get('https://api.mayonedev.com/chzzk');
                const data = [];
                for (const stream of response.data.content.data) {
                    data.push({
                        id: stream.liveId,
                        platform: ['chzzk'],
                        thumbnail_url: stream.liveImageUrl.replace('{type}','270'),
                        profile_image_url: stream.channel.channelImageUrl,
                        user_name: stream.channel.channelName,
                        title: stream.liveTitle,
                        game_name: stream.liveCategory.replace(/_/g,' '),
                        viewer_count: stream.concurrentUserCount,
                        url: {chzzk: "https://chzzk.naver.com/live/" + stream.channel.channelId}
                    });
                }
                console.log(response);
                setStreamsCZZ(data);
            } catch (error) {
                console.error('Error fetching streams:', error);
                // 에러 처리 로직을 추가하세요.
            }
        };

        fetchStreams();
        fetchStreamsCzz();

    }, []);
    
    useEffect(() => {

        const data = streamsTW.concat(streamsCZZ);

        // 만약 streams에 user_name이 중복되는 경우가 있다면, 중복을 제거하고 viewer_count를 합산.
        
        for (let i = 0; i < data.length; i++) {
            for (let j = i+1; j < data.length; j++) {
                if (data[i].user_name.replace(/ /g,'').includes(data[j].user_name.replace(/ /g,'')) ||
                    data[i].title.includes(data[j].title)) {
                    data[i].viewer_count = (parseInt(data[i].viewer_count) + parseInt(data[j].viewer_count));
                    data[i].platform.push(data[j].platform[0]);
                    data[i].url = {...data[i].url, ...data[j].url};
                    data.splice(j,1);
                }
                else if (data[j].user_name.replace(/ /g,'').includes(data[i].user_name.replace(/ /g,'')) ||
                    data[j].title.includes(data[i].title)) {
                    data[i].viewer_count = (parseInt(data[i].viewer_count) + parseInt(data[j].viewer_count));
                    data[i].platform.push(data[j].platform[0]);
                    data[i].url = {...data[i].url, ...data[j].url};
                    data.splice(j,1);
                }
            }
        }
        // viewer_count를 기준으로 내림차순 정렬해주세요.
        data.sort((a,b) => b.viewer_count - a.viewer_count);

        setAddStreams(data);
    }, [streamsTW, streamsCZZ]);

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

    return (
        <div className='container'>
            <div className='mb-5' style={{ display: "flex", justifyContent: "center" }}>
                <img src='allive_log.png' alt='allive'/>
            </div>
            <div className='row'>
                {addStreams.map(stream => (
                    <div key={stream.id} className='col-3 mb-3'>
                        
                        <div class="card border-0 bg-dark">
                            <div className='position-relative rounded' onMouseEnter={(e)=>{e.stopPropagation(); setShowOverlay(stream.id)}}>
                                <img src={stream.thumbnail_url} className="card-img-top rounded" alt={stream.user_name}/>
                                <div className='position-absolute top-0 start-0 m-2'>
                                    <div className='d-flex align-items-center'>
                                        <div className='p-1 text-bg-danger rounded fw-bold' style={{fontSize: "12px"}}>
                                            LIVE
                                        </div>
                                        <div className='p-1 bg-dark rounded ms-1 text-light' style={{fontSize: "12px"}}>
                                            {stream.viewer_count.toLocaleString()} 시청
                                        </div>
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
                                    <div>
                                        <img className='rounded-pill' src={stream.profile_image_url} alt={stream.user_name} width='40px' height='40px'/>
                                    </div>
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
            </div>
        </div>
    );
};

export default Dashboard;
