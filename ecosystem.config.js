module.exports = {
    apps: [
      {
        name: 'api.services.agentsoncloud.com', // change to your subdomain name 
        script: 'server.js', // change to your index.js entrypoint
        instances : "4",
        exec_mode : "cluster",
      },
      // s
    ],
  }
  
