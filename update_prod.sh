npm run ionic:build --prod
pushd www/build
gzip main.js
mv main.js.gz main.js
rm *.map
popd
aws s3 sync www/ s3://app.moxiereader.com/
aws s3 cp --content-encoding 'gzip' www/build/main.js s3://app.moxiereader.com/build/main.js
