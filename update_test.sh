ionic cordova build browser --prod
pushd www/build
gzip main.js
mv main.js.gz main.js
rm *.map
popd
aws s3 sync platforms/browser/www/ s3://app.test.moxiereader.com
aws s3 cp --content-encoding 'gzip' www/build/main.js s3://app.test.moxiereader.com/build/main.js
