angular.module('gokibitz.controllers')
	.controller('UploadController',
		function ($scope, FileUploader) {
			var path = require('path');
			//console.log('upload control', FileUploader);
			var uploader = $scope.uploader = new FileUploader({
				url: '/api/kifu/upload',
			});

			console.log('$scope.uploader', $scope.uploader);


			// FILTERS

			uploader.filters.push({
				name: 'sgfFilter',
				fn: function(item, options) {
					console.log('item', item);
					console.log('options', options);

					console.log('path.extname(item.name)', path.extname(item.name));


					return path.extname(item.name) === '.sgf';
				}
			});

			// CALLBACKS

			uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
				console.info('onWhenAddingFileFailed', item, filter, options);
				$scope.notAnSgf = item;
			};
			uploader.onAfterAddingFile = function(fileItem) {
				console.info('onAfterAddingFile', fileItem);
				fileItem.public = true;
				$scope.notAnSgf = null;
			};
			uploader.onAfterAddingAll = function(addedFileItems) {
				console.info('onAfterAddingAll', addedFileItems);
			};
			uploader.onBeforeUploadItem = function(item) {
				console.info('onBeforeUploadItem', item);
				$scope.notAnSgf = null;
				item.formData.push({ public: item.public });
			};
			uploader.onProgressItem = function(fileItem, progress) {
				console.info('onProgressItem', fileItem, progress);
			};
			uploader.onProgressAll = function(progress) {
				console.info('onProgressAll', progress);
			};
			uploader.onSuccessItem = function(fileItem, response, status, headers) {
				console.info('onSuccessItem', fileItem, response, status, headers);
				fileItem.shortid = response.shortid;
			};
			uploader.onErrorItem = function(fileItem, response, status, headers) {
				console.info('onErrorItem', fileItem, response, status, headers);
			};
			uploader.onCancelItem = function(fileItem, response, status, headers) {
				console.info('onCancelItem', fileItem, response, status, headers);
			};
			uploader.onCompleteItem = function(fileItem, response, status, headers) {
				console.info('onCompleteItem', fileItem, response, status, headers);
				fileItem.shortid = response.shortid;
			};
			uploader.onCompleteAll = function() {
				console.info('onCompleteAll');
			};

			//uploader.bind('complete', function (event, xhr, item, response) {
			//	console.info('Complete', xhr, item, response);
			//	//item.shortid = response.shortid;
			//});

		}
	);
