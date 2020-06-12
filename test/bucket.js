'use strict';
/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Riptide Software Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (chai, chaiAsPromised, Promise, S3FS) {
    var expect = chai.expect;

    chai.use(chaiAsPromised);
    chai.config.includeStack = true;

    describe('S3FS Buckets', function () {
        var bucketName,
            s3fsImpl;

        beforeEach(function () {
            bucketName = 's3fs-bucket-test-bucket-' + (Math.random() + '').slice(2, 8);
            s3fsImpl = new S3FS(bucketName);
        });

        afterEach(function (done) {
            s3fsImpl.destroy().then(function () {
                done();
            }, function (reason) {
                if (reason.code === 'NoSuchBucket') {
                    // If the bucket doesn't exist during cleanup we don't need to consider it an issue
                    done();
                } else {
                    done(reason);
                }
            });
        });


        it('should be able to list all the files in a bucket', function () {
            return expect(s3fsImpl.create()
                    .then(function () {
                        return s3fsImpl.mkdir('testDir/')
                            .then(function () {
                                return s3fsImpl.writeFile('testDir/test.json', '{}')
                                    .then(function () {
                                        return s3fsImpl.writeFile('testDir/test/test.json', '{}');
                                    });
                            })
                            .then(function () {
                                return s3fsImpl.mkdir('testDirDos/')
                                    .then(function () {
                                        return s3fsImpl.writeFile('testDirDos/test.json', '{}');
                                    });
                            });
                    })
                    .then(function () {
                        return s3fsImpl.readdir('/');
                    })
            ).to.eventually.satisfy(function (files) {
                    expect(files).to.have.lengthOf(2);
                    expect(files[0]).to.equal('testDir/');
                    expect(files[1]).to.equal('testDirDos/');
                    return true;
                });
        });

        it('should be able to list all the files in a bucket with a callback', function () {
            return expect(s3fsImpl.create()
                    .then(function () {
                        return s3fsImpl.mkdir('testDir/')
                            .then(function () {
                                return s3fsImpl.writeFile('testDir/test.json', '{}')
                                    .then(function () {
                                        return s3fsImpl.writeFile('testDir/test/test.json', '{}');
                                    });
                            })
                            .then(function () {
                                return s3fsImpl.mkdir('testDirDos/')
                                    .then(function () {
                                        return s3fsImpl.writeFile('testDirDos/test.json', '{}');
                                    });
                            });
                    })
                    .then(function () {
                        return new Promise(function (resolve, reject) {
                            s3fsImpl.readdir('/', function (err, data) {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(data);
                            });
                        });
                    })
            ).to.eventually.satisfy(function (files) {
                    expect(files).to.have.lengthOf(2);
                    expect(files[0]).to.equal('testDir/');
                    expect(files[1]).to.equal('testDirDos/');
                    return true;
                });
        });

    });
}(require('chai'), require('chai-as-promised'), require('bluebird'), require('../')));
