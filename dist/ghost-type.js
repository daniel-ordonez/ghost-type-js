
"use strict"
/** 
 * @author Daniel Ordonez - daniel-ordonez.github.io
 * @description ghostType Object Class
 * @version 0.0.1
 * @license ISC
 */
class ghostType{
    static get states(){
        return {
            IDLE:'idle',
            TYPING:'typing',
            DELETING:'deleting',
            PAUSED:'paused',
            ERROR:'error'
        }
    }
    static get processMode(){
        return { LINEAR:'linear', NATURAL:'natural' }
    }
    static get defaultOptions(){
        return {
            typing: {
                maxSpeed:260, 
                minSpeed:100,
                mode: ghostType.processMode.NATURAL,
                plainText: false,
                auto: true,
                class: 'ghost-typing',
                cursor: '|',
                char:{
                    element: 'span',
                    class: ['ghost-char']
                },
                loop: false,
                delay: false // applies before each group
            },
            deleting: {
                maxSpeed:260, 
                minSpeed:100,
                mode: ghostType.processMode.NATURAL
            }
        }
    };
    /**
     * 
     * @param {Node | String} element - if none given an error is thrown
     * @param {Object} options 
     */
    constructor( element, options = {}, dev = false, name = "ghost" ){
        // Setup state
        this.states = ghostType.states;
        this._setState(this.states.IDLE);
        // Validate params
        this.dev = typeof dev === 'boolean'? dev : false;
        this.name = name ? name : 'ghost';
        this.element = this._getElement( element );
        if( !this.element ){ 
            this._log("invalid element",element);
            this._setState( this.states.ERROR ); 
            return; 
        }
        this.options = this._getOptions( options, ghostType.defaultOptions );
        // Setup writing queue
        this._queue = []; 
        this._groupIndex = 0;
        // Use content in element?
        if( this.options.useContent ){
            if( typeof this.options.useContent === "object" ){
                this.takeFrom( this.element, this.options.useContent.preserve )
            }else this.takeFrom( this.element, false );
        }
        // Setup wrapper
        if( !this.options.typing.plainText ){

        }
        this._injectCSS();
        // Ready
        this._log("ready");
    }
    _injectCSS(){
        let style = document.getElementById("ghost-type-css");
        if( !style ){
            style = document.createElement( "style" );
            style.id = "ghost-type-css";
            style.type = 'text/css';
        }
        let cursorClass = "."+this.options.typing.class;
        let cursorChar = this.options.typing.cursor;
        let css = `\
        @keyframes ghost-cursor-blink {\
            from{\
                opacity: 1;\
            }\
            50%{\
                opacity: 0;\
            }\
            to{\
                opacity: 1;\
            }\
        }\
        ${cursorClass}::after {
            content: '${cursorChar}';
            display: inline;
            -webkit-animation: ghost-cursor-blink 0.7s infinite;
            -moz-animation: ghost-cursor-blink 0.7s infinite;
            animation: ghost-cursor-blink 0.7s infinite;
        }
        `
        style.appendChild(document.createTextNode(css));
        document.head.appendChild( style );
    }
    _clearText( node ){
        node.textContent = "";
        this._log("cleaned text of "+node.outerHTML);
    }
    _setState( s ){
        if( s === this.states.TYPING ){this.element.classList.add( this.options.typing.class )}
        else if( this._state === this.states.TYPING ){this.element.classList.remove( this.options.typing.class )};
        this._state = s;
        this._log("state set to",s);
    }
    _getElement( el ){
        if ( el instanceof HTMLElement ) return el;
        else if ( typeof el === "string" ) return document.querySelector( el );
    }
    _getOptions( givenOptions, defaultOptions ){
        const correctValue = ( givenValue, defaultValue ) => {
            return typeof givenValue === typeof defaultValue ? givenValue : defaultValue;
        }
        const correctObject = ( objectA, objectB ) => {
            for( let property in objectB ){
                if( typeof objectB[property] === "object" ){
                    if( typeof objectA[property] === "object" ){
                        objectA[ property ] = correctObject( objectA[property], objectB[property] );
                    }else objectA[ property ] = objectB[ property ];
                }else{
                    objectA[property] = correctValue( objectA[property], objectB[property] );
                }
            }
            return objectA;
        }
        return correctObject( givenOptions, defaultOptions );
    }
    _getTypeFunction(){
        let wrapper = this.element;
        return this.options.typing.plainText ? (text) => {
            this.element.textContent += text;
        } : (text) => {
            let char = document.createElement( this.options.typing.char.element );
            let charClass = this.options.typing.char.class;
            for( let cls in charClass ){
                char.classList.add( charClass[cls] );
            }
            if( text === " " ){
                char.innerHTML = "&nbsp;"
            }else char.textContent = text;
            wrapper.appendChild( char );
        }
    }
    /**
     * 
     * @param {object} action - options.type/ options.delete
     * @todo add 'ease' mode to return an ease time function
     * @returns {function} f - returns the ms time for next action
     */
    _getTimeFunction( action ){
        if( action.mode === ghostType.processMode.NATURAL ){ 
            return ( ) =>  Math.floor(Math.random() * (action.maxSpeed - action.minSpeed)) + action.minSpeed;
        }else return ( ) => action.minSpeed;
    }
    _timeout(t){
        return new Promise( (resolve, rejected) => { setTimeout(resolve,t) } );
    }
    _log( text, arg ){ 
        if( !this.dev ) return;
        if( arg )console.log(`${this.name} - ${text} : ${arg}`); else console.log(`${this.name} - ${text}`);
    };
    _updateText( wrapper, text ){
        wrapper.textContent = text;
        this.options.onUpdate && this.options.onUpdate( text );
    }
    queueAdd( text ){
        if( typeof text === "string" && text.length > 0 ){
            this._queue.push( text );
        }else if( typeof text === "object" ){
            this._queue.push( text );
        }else if( Array.isArray( text ) ){
            this._queue.concat( text );
        }else{
            this._log( "not valid for queue",text );
        }
        this._log("added [" + typeof text + "] to queue", text );
    }
    queueEmpty(){
        this._queue = [];
    }
    takeFrom( target, preserve ){
        let node = this._getElement( target );
        if( !node ){ this._log("invalid target",target); return;}

        let text = node.textContent;
        if( typeof preserve !== "boolean" ) this._clearText( node );
        else if( !preserve )  this._clearText( node );

        this.queueAdd( text );        
    }
    deleteAll(){
    }
    deleteLast(){
    }
    /**
     * 
     * @param {String | Array } text - What will be written
     * @description sets up the typing queue and starts the typing loop is auto is true
     */
    type( text ){
        text && this.queueAdd( text );

        // Leave if the loop is already active
        if( this.typingLoop ){
            this._log("typing loop is ",this._state);
            return;
        }

        let queueReder = function* ( q, i ) {
            while (  q.length > i )
                yield i ++;
        };
        let timeFunction = this._getTimeFunction( this.options.typing );
        let typeFunction = this._getTypeFunction();

        // Start typing loop
        this.typingLoop = new Promise( async( resolve, reject ) => {
            this._setState( this.states.TYPING );
            const resolveLoop = () =>{
                resolve();
                this._log("typing completed");
                this._onComplete && this._onComplete();
                this._setState( this.states.IDLE );
                this.typingLoop = false;
            }
            this._resolveLoop = resolveLoop;
            // Wait delay
            if( typeof this.options.typing.delay == "number" ) await this.options.typing.delay;
            // Loop groups in queue
            while( this._queue.length > this._groupIndex ){
                let currentGroup = this._queue[ this._groupIndex ];
                this._log("current group",currentGroup);
                this.onGroupUpdate && this.onGroupUpdate( currentGroup );
                // loop characters in group
                let readChars = queueReder( currentGroup, 0 );
                let chars = readChars.next();
                this._log("chars",chars);
                console.log(chars);
                while( !chars.done ){
                    if( this.isPaused ) await this.pausePromise;
                    let currentChar =  currentGroup[chars.value];
                    this._log("next char",currentChar);
                    if( !this.options.typing.auto  ){
                        await new Promise( (resolve, reject)=>{ this._nextChar = () =>{ this._nextChar = false; resolve();} });
                        typeFunction( currentChar );
                    }else{
                        // Simulates time to type new character
                        let time = timeFunction();
                        //this._log("time to type",time);
                        await this._timeout( time );
                        typeFunction( currentChar );
                    }
                    chars = readChars.next();
                }
                this._groupIndex ++;
            }
            this._onComplete && this._onComplete();
            resolveLoop();
        });
        //initiates cursor
        return this
    }
    nextChar(){
        this._nextChar && this._nextChar();
    }
    /**
     * @description Sets typing auto to false. Typing can still occur with nextChar
     * @param {Number} time - milliseconds to resume, if left null it remains paused until resume() is called
     */
    pause( time ){
        if( !this.typingLoop ){ 
            this._log("can't pause","typing loop is not active"); return this
        }else if( this.isPaused ){ 
            this._log("can't pause","typing loop is already paused"); return this;
        }
        this.pausePromise = new Promise( ( resolve, rejected ) => { 
            this._log("pausing");
            this._setState( this.states.PAUSED );
            this._resolvePause = () => {
                this._log("resuming");
                if( this.typingLoop ) this._setState( this.states.TYPING )
                else this._setState( this.states.IDLE );
                resolve();
            }
            if( time && typeof time === 'number' ) setTimeout( this._resolvePause, time );
        });
        return this;
    }
    /**
     * @description If typing loop is active, sets state to typing, otherwise to idle
     */
    resume(){
        if( !this.isPaused ){
            this._log("can't resume","typing loop is not paused"); return this;
        }
        this._resolvePause();
        return this;
    }
    finish(){
        //this.wrapper.innerText = this.text;
        this.typePromise.resolve();
    }
    update( options ){
        this.options = this._getOptions( options, ghostType.defaultOptions );
    }

    get finished(){
        return this.typingLoop
    }
    get resumed(){
        return this.pausePromise
    }
    get queue(){
        return this._queue
    }
    get state(){
        return this._state;
    }
    get isPaused(){
        return this._state === this.states.PAUSED;
    }
    get isTyping(){
        return this._state === this.states.TYPING;
    }
    get isIdle(){
        return this._state === this.states.IDLE;
    }

}