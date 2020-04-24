module.exports = {
    //sqlite database (must be absolute path)
    db: 'C:\\dynmap\\dynmap.db',

    //dynmap config (must be absolute path)
    dynmapConfig: 'C:\\dynmap\\dynmap_config.json',

    //dynmap session stuff
    sessionSecret: 'dynmap_node_secret',
    
    //url pages
    root: '/dapi', //if using iis, have this the same name as the alias with an '/' at the beginning, otherwise, leave it blank
    pages :{
        tiles: "/node_tiles",
        markers: "/node_markers",
        sendmsg: "/node_sendmsg", //todo
        login: "/node_login", //todo
        reg: "/node_reg" //todo
    }
};