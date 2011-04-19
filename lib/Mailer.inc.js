var Mailer_Message = Class.create({
	initialize: function(args){
		this.config = {
				recipients: {
					to: [],
					cc: [],
					bcc: []
				},
				attachments:[],
				subject:'',
				body:''
			}
		for( var k in args ) {
			this._configure( k, args[k] );
		}
	}
,	_configure: function( key, val ){
		switch( key ){
			case 'to':
			case 'cc':
			case 'bcc':
				this._addRecipients( key, val );
				break;
			case 'subject': 
				subject( val );
				break;
			case 'body':
				body( val );
				break;
			case 'attach':
			case 'attachment':
				attach( val );
				break;
			default:
				Assert.Fail( 'Unknown configuration key [{0}]', key );
		}
	}
,	to: function( recipients ){ this._addRecipients('to', recipients ); return this; }
,	cc: function( recipients ){ this._addRecipients('cc', recipients ); return this; }
,	bcc: function( recipients ){ this._addRecipients('bcc', recipients ); return this; }

,	body: function( str, append /*=false*/ ){
		if( !( append || false ) ) this.config.body = '';
		this.config.body = this._parseArgumentValue( str );
		return this;
	}
,	subject: function( str ){
		this.config.subject = this._parseArgumentValue( str );
		return this;
	}
,	attach: function(paths){
		if( paths.constructor.toString().indexOf("Array") == -1 )
			paths = [paths];
		
		while(paths.length)
			this.config.attachments.push( paths.shift() );
		
		return this;
	}
,	_addRecipients: function( key, recipients ){
		if( recipients.constructor.toString().indexOf("Array") == -1 )
			recipients = recipients.split(/[,;]/g);
		
		while( recipients.length ) {
			this.config.recipients[key].push( recipients.shift() );
		}
	}
,	_parseArgumentValue: function( str ){
		if( str.indexOf('@')!=0 ) return str;
		
		Assert.Fail('File Descriptors not supported in this version.')
	}
,	toString: function(){
		var ret = [];
		
		function escapeDoubleQuotes(str){
			return str.replace(/[\\"]/g, '\\$&');
		}
		
		for( var type in this.config.recipients ) {
			if(this.config.recipients[type].length)
				ret.push( '-{0} "{1}"'.Format( type, escapeDoubleQuotes( this.config.recipients[type].join(',') ) ) )
		}
		
		ret.push('-subject "{0}"'.Format( escapeDoubleQuotes( this.config.subject ) ) )
		ret.push('-body "{0}"'.Format( escapeDoubleQuotes( this.config.body ) ) )
		
		if( this.config.attachments.length ){
			for( var i =0; i < this.config.attachments.length; i++ ){
				ret.push( '-attach "{0}"'.Format( this.config.attachments[i] ) )
			}
			ret.push( '-base64' )
		}
		
		return ret.join(' ');
	}
,	ready: function(){
		return new Boolean( this.missingRequirements().length );
	}
,	missingRequirements: function() {
		var ret = [];
		if( this.config.recipients.to.length == 0) ret.push('Recipient: To');
		if( this.config.body.length == 0) ret.push('Body');
		if( this.config.subject.length == 0) ret.push('Subject');
		return ret;
	}
});

var Mailer = Class.create({
	initialize: function( args ){
		Assert.Executable('blat.exe');
		this.config = {};
		for( var k in args ) {
			this._configure( k, args[k] );
		}
	}
,	_configure: function( key, val ){
		this.config[key] = val;
	}
,	_isConfigured: function( key ){
		return this.config[key] || false;
	}
,	send: function( mailMessage ){
		if( !( mailMessage instanceof Mailer_Message ) )
			Assert.Fail( 'Mailer::send() requires 1 argument of type Mailer_Message' );
		if( !mailMessage.ready() )
			Assert.Fail( 'MailMessage not ready: ' + mailMessage.missingRequirements() );
		
		var command = ['blat.exe'];
		if( this._isConfigured('server') ) command.push( '-server "{0}"'.Format( this.config.server ) )
		if( this._isConfigured('port') ) command.push( '-port "{0}"'.Format( this.config.port ) )
		if( this._isConfigured('from') ) {
			command.push( '-f "{0}"'.Format( this.config.from ) )
			command.push( '-from "{0}"'.Format( this.config.from ) )
		}
		$$( command.join(' ') +' '+ mailMessage.toString() );
		return ( $ERRORLEVEL ? false : true );
	}
});