import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Streams from './streams';

const Dashboard = () => {
    const [streamsTW, setStreamsTW] = useState([]);
    const [streamsCZZ, setStreamsCZZ] = useState([]);
    const [addStreams, setAddStreams] = useState([]);
    

    const [focusSearch, setFocusSearch] = useState(false);
    const [search, setSearch] = useState(localStorage.getItem('search') ? JSON.parse(localStorage.getItem('search')) : []);
    const [autoSave, setAutoSave] = useState(localStorage.getItem('autoSave') ? localStorage.getItem('autoSave') === 'true' : true);
    const [focusRecentSearch, setFocusRecentSearch] = useState(false);
    const refSearch = useRef(null);
    const [valueSearch, setValueSearch] = useState('');

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const searchStream = async () => {
        // 검색어가 없으면 리턴
        if (valueSearch === '') return;
        // console.log('검색어:', encodeURIComponent(valueSearch));
        // try{
        //     const response = await axios.get('https://api.twitch.tv/helix/search/channels', {
        //         headers: {
        //             'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
        //             'Authorization': `Bearer ${process.env.REACT_APP_TWITCH_CLIENT_TOKEN}`
        //         },
        //         params: {
        //             query: valueSearch,
        //             live_only: true
        //         }
        //     });
        //     console.log(response.data);

        // }
        // catch (error) {
        //     console.error('Error fetching streams:', error);
        // }
        
        try{
            const response = await axios.get('https://api.twitch.tv/helix/search/channels', {
                headers: {
                    'Client-ID': process.env.REACT_APP_TWITCH_CLIENT_ID,
                    'Authorization': `Bearer ${process.env.REACT_APP_TWITCH_CLIENT_TOKEN}`
                },
                params: {
                    query: valueSearch,
                    live_only: true
                }
            });
            const data = [];
            for (const stream of response.data.data) {
                if (stream.broadcaster_language === 'ko' || stream.broadcaster_language === 'kr') {
                    data.push({
                        id: stream.id,
                        platform: ['twitch'],
                        thumbnail_url: stream.thumbnail_url.replace('{width}','480').replace('{height}','270'),
                        user_name: stream.display_name,
                        title: stream.title,
                        game_name: stream.game_name,
                        viewer_count: stream.viewer_count || 0,
                    });
                }
            }
            setStreamsTW(data);
            // 현재는 트위치만 검색 가능
            setStreamsCZZ([]);
        }
        catch (error) {
            console.error('Error fetching streams:', error);
        }
    };

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
                        thumbnail_url: stream.liveImageUrl ? stream.liveImageUrl.replace('{type}','270') : null,
                        profile_image_url: stream.channel.channelImageUrl,
                        user_name: stream.channel.channelName,
                        title: stream.liveTitle,
                        game_name: (''+stream.liveCategory).replace(/_/g,' '),
                        viewer_count: stream.concurrentUserCount,
                        url: {chzzk: "https://chzzk.naver.com/live/" + stream.channel.channelId}
                    });
                }
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
                if (data[i].user_name.replace(/ /g,'').includes(data[j].user_name.replace(/ /g,''))
                    || data[j].user_name.replace(/ /g,'').includes(data[i].user_name.replace(/ /g,''))
                    || data[i].title === data[j].title) {
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
    
    const handleEnterSearch = (e) => {
        if (e.key === 'Enter') {
            setFocusSearch(false);
            setLoading(true);
            if(e.target.value === '') return;
            let result = search;
            result.unshift(e.target.value);
            // 중복이면 0 인덱스로 변경
            if (result.length > 1) {
                for (let i = 1; i < result.length; i++) {
                    if (result[0] === result[i]) {
                        // 중복 제거
                        result.splice(i,1);
                    }
                }
            }
            // 10개 제한
            if (result.length > 10) {
                result.pop();
            }
            localStorage.setItem('search', JSON.stringify(result));
            setSearch([].concat(result));
            e.target.parentNode.parentNode.focus();
            e.target.parentNode.parentNode.blur();
            searchStream();
            setTimeout(() => {
                e.target.blur();
            }, 1);
        }
    };

    const handleAutoSave = () => {
        if (autoSave) {
            setSearch([]);
            localStorage.removeItem('search');
        }
        localStorage.setItem('autoSave', !autoSave);
        setAutoSave(!autoSave);
    };

    const handleBlurSearch = () => {
        if (!focusRecentSearch) {
            setFocusSearch(false);
        }
        else {
            refSearch.current.focus();
        }
    };

    const handleHomeIcon = () => {
        navigate('/');
    };


    // 최근 검색 내역
    const ViewRecentSearch = () => {
        return (
            <div className='position-absolute top-0 start-0 w-100 rounded-4 bg-dark lineasd rounded shadow-lg'
                style={{minHeight: "300px", zIndex: "1", marginTop: "45px"}}
                onMouseEnter={()=>{setFocusRecentSearch(true)}} onMouseLeave={()=>{setFocusRecentSearch(false)}}
                >
                <div className='m-2'>
                    {search.length > 0 ? 
                        (
                            <div>
                                <div className='text-white-50 m-2 d-flex justify-content-between'>
                                    <div className=''
                                        style={{fontSize:"12px", cursor: "default"}}>
                                        최근 검색어
                                    </div>
                                    <div style={{fontSize:"12px", cursor: "pointer"}}>
                                        전체 삭제
                                    </div>
                                </div>
                                <table className='table table-dark table-hover table-borderless rounded rounded-4 mb-4'>
                                    <tbody>
                                        {search.map((s, index) => (
                                            <tr>
                                                <td>
                                                    <span className="material-symbols-outlined text-white-50"
                                                        style={{fontSize: "14px", cursor: "default"}}>schedule</span>
                                                </td>
                                                <td className='text-white-50 w-100' style={{fontSize: "13px", cursor: "default"}}>
                                                    {s}
                                                </td>
                                                <td>
                                                    <span class="material-symbols-outlined text-white-50"
                                                        style={{fontSize: "14px", cursor: "pointer"}}>
                                                        close
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                    ):
                    (
                    <div className='d-flex align-items-center h-100'>
                        <div className='h-100 w-100 d-flex justify-content-center align-items-center'>
                            <div className='text-white-50' style={{cursor: "default"}}>
                                {autoSave ? (<>최근 검색이 없습니다.</>) : (<>자동저장이 꺼져있습니다.</>)}
                            </div>
                        </div>
                    </div>
                    )}
                    <div className='position-absolute bottom-0 end-0 align-text-bottom text-white-50 m-2 me-3'
                        style={{fontSize: "12px", cursor: "pointer"}}
                        onClick={handleAutoSave}>
                        {autoSave ? (
                            <>
                                자동저장 끄기
                            </>
                        ) : (
                            <>
                                자동저장 켜기
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div className='container'>
            <div className='mb-2 d-flex justify-content-center'>
                <img src='allive_log.png' alt='allive' 
                    style={{ maxWidth: "100%", maxHeight: "100%", cursor: "pointer"}}
                    onClick={handleHomeIcon}/>
            </div>
            <div className="input-group mb-5 d-flex justify-content-center">
                <div className={`position-relative rounded-pill d-flex justify-content-center bg-dark ${focusSearch?"lineasd":"border border-secondary border-opacity-50"}`}
                    style={{width: "400px", height: "40px", maxWidth: "100%", maxHeight: "100%" }}>
                    <input type="text" className="search-input bg-dark d-inline ms-3" placeholder="현재 검색은 트위치만 가능합니다." name="search"
                        style={{width:"330px"}}
                        onClick={()=>{setFocusSearch(true)}}
                        onBlur={handleBlurSearch}
                        onKeyDown={handleEnterSearch}
                        onChange={(e)=>{setValueSearch(e.target.value)}}
                        ref={refSearch}
                        autocomplete='off'/>
                    <div class="input-group-append d-inline">
                        <button type="submit" className="bg-dark border-0 text-white h-100 rounded-pill material-symbols-outlined opacity-50">search</button>
                    </div>
                    {focusSearch && <ViewRecentSearch/>}
                </div>
            </div>
            <div className='row row-cols-auto justify-content-center'>
                <Streams streams={addStreams} loading={loading} setLoading={setLoading} />
            </div>
        </div>
    );
};

export default Dashboard;
