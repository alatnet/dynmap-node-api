module.exports = {
    //database type
    //0 - flat files
    //1 - sqlite (uncomment the single db line and set absolute path to the database file)
    //2 - mysql (uncomment the multiline db and set it's variables)
    dbType: 0,

    //sqlite database (must be absolute path)
    //db: 'C:\\dynmap\\dynmap.db',

    //mysql database information
    // db: {
    //     url: 'localhost',
    //     user: 'dynmap',
    //     pass: 'dynmap',
    //     db: 'dynmap',
    // },

    //dynmap config (must be absolute path)
    dynmapConfig: 'C:\\dynmap\\dynmap_config.json',

    //dynmap session stuff
    sessionSecret: 'dynmap_node_secret',
    
    //url pages
    root: '/dapi', //if using iis, have this the same name as the alias with an '/' at the beginning, otherwise, leave it blank
    pages: {
        tiles: "/node_tiles",
        markers: "/node_markers",
        sendmsg: "/node_sendmsg", //todo
        login: "/node_login", //todo
        reg: "/node_reg", //todo
        update: "/node_update" //todo?
    },

    //paths for flat files. (must be absolute path)
    flatPaths: {
        markers: 'C:\\dynmap\\tiles\\',
        tiles: 'C:\\dynmap\\tiles\\',
        blank: 'C:\\dynmap\\images\\blank.png'
    }
};