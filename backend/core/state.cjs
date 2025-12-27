const state = {
    memory: require('./memory.cjs').memory,
    stats: {
        messages: 0
    }
};

module.exports = { state };
