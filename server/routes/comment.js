var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Kifu = require('../models/kifu').Kifu;
var User = require('../models/user').User;
var Comment = require('../models/comment').Comment;

router.post('/', auth.ensureAuthenticated, function (req, res) {
	Kifu.findOne({
		_id: req.body._id
	}, function (error, kifu) {
		if (!error && kifu) {
			var comment = new Comment();

			comment.kifu = kifu;
			comment.user = req.user;
			comment.path = req.body.path;
			comment.content.markdown = req.body.content;

			console.log('comment.path', comment.path);
			comment.save(function (error) {
				if (!error) {
					res.json(201, { message: 'Comment created with id: ' + comment._id });
				} else {
					res.json(500, { message: 'Could not create comment. Error: ' + error });
				}
			});

		} else if (error) {
			res.json(500, { message: 'Error creating comment. ' + error });
		} else {
			res.json(404, { message: 'No kifu found for _id:' + req.params._id });
		}
	});
});

router.get('/:id', function (req, res) {
	var id = req.params.id;

	Comment
		.findById(id)
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {
			if (!error) {
				res.json('200', comment);
			} else {
				res.json('500', { message: error });
			}
		});
});

router.delete('/:id', auth.ensureAuthenticated, function (req, res) {
	var id = req.params.id;

	Comment
		.findById(id)
		// TODO: The fact that the isOwner method relies on this external populate
		// method is bad, bad, bad. How do we deal with this?
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {

			if (!error && comment) {
				console.log('hi!', comment.isOwner(req.user));
				if (!comment.isOwner(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t delete another user\'s comment.' });
				} else {
					comment.remove();
					res.json(200, { message: 'Comment removed.' });
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find comment.' });
			} else {
				res.json(403, { message: 'Could not delete comment. ' + error });
			}
		});
});

router.put('/:id', auth.ensureAuthenticated, function (req, res) {
	var id = req.params.id;
	var markdown = req.body.content.markdown;

	Comment
		.findById(id)
		.populate('user', 'username email gravatar')
		.exec(function (error, comment) {
			if (!error && comment) {
				if (!comment.isOwner(req.user) && !req.user.admin) {
					res.json(550, { message: 'You can\'t edit another user\'s comment.' });
				} else {
					comment.content.markdown = markdown;
					comment.save(function (error) {
						if (!error) {
							res.json(200, {
								message: 'Comment updated.',
								comment: comment
							});
						} else {
							res.json(500, { message: 'Could not update comment.' + error });
						}
					});
				}
			} else if (!error) {
				res.json(404, { message: 'Could not find comment.' });
			} else {
				res.json(403, { message: 'Could not update comment. ' + error});
			}
		});
});

module.exports = router;
