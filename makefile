publish:
	rsync -avz --exclude='.next' --exclude='node_modules' -e 'ssh -i ~/Desktop/external_project/xone_chain/xone-Singapore.pem' ./* ubuntu@13.215.245.103:/home/ubuntu/explorer-frontend

zip:
  zip -r xone-explorer.zip . -x "node_modules/*" ".next/*" ".git/*"