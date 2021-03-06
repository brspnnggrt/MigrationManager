var IW = IW || {};
IW.Reactors = IW.Reactors || {};

IW.Reactors.CommentBox = React.createClass({
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    // Optimistically set an id on the new comment. It will be replaced by an
    // id generated by the server. In a production application you would likely
    // not use Date.now() for this and would have a more robust system in place.
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({
      data: newComments
    });
    this.props.onCommentSubmit({
      comments: newComments
    });
  },
  getInitialState: function() {
    return {
      data: this.props.data || [] // seeding initial state from props
    };
  },
  render: function() {
    return (
      <div className="commentBox">
        <IW.Reactors.CommentBox.CommentList data={this.state.data} />
        <IW.Reactors.CommentBox.CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

IW.Reactors.CommentBox.CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <IW.Reactors.CommentBox.Comment author={comment.author} key={comment.id}>
          {comment.text}
        </IW.Reactors.CommentBox.Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

IW.Reactors.CommentBox.CommentForm = React.createClass({
  getInitialState: function() {
    return {
      author: '',
      text: ''
    };
  },
  handleAuthorChange: function(e) {
    this.setState({
      author: e.target.value
    });
  },
  handleTextChange: function(e) {
    this.setState({
      text: e.target.value
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({
      author: author,
      text: text
    });
    this.setState({
      author: '',
      text: ''
    });
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Your name"
          value={this.state.author}
          onChange={this.handleAuthorChange}
          className="input"
        />
        <textarea
          type="text"
          placeholder="Say something..."
          value={this.state.text}
          onChange={this.handleTextChange}
          className="textarea"
        />
        <button className="button" type="submit" value="Post" >Post</button>
      </form>
    );
  }
});

IW.Reactors.CommentBox.Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {
      sanitize: true
    });
    return {
      __html: rawMarkup
    };
  },
  render: function() {
    return (
      <div className="comment">
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
        <span className="commentAuthor">
          {this.props.author}
        </span>
      </div>
    );
  }
});