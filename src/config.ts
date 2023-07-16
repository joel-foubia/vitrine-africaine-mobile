/** Configuration des patterns API **/
/** Configuration de la sauvegarde locale **/
export class ApiConfig {
	/**
	 * Landry's urls
	 * 
	 */

	static url_categories = '/wp-json/wc/v2/products/categories';
	static url_customer = '/wp-json/wc/v2/customers';
	static url_orders = '/wp-json/wc/v2/orders';
	static url_product_list = '/wp-json/wc/v2/products';
	static url_gateways = '/wp-json/wc/v2/payment_gateways';
	static url_login = '';
	
	static url_how_it_works = '/frequently-asked-questions/?json=1';

	static pattern = '/wp-json/wp/v2/';
	static url_about = '/a-propos/?json=1'; //url api A Propos
	static url_articles = '/wp-json/wp/v2/posts'; //url api liste actualités
	static Max_Petition = 100;
	static url_culinaire = '/wp-json/wp/v2/posts';
	static nom_app = 'Vitrine Africaine';
	static url_pays = '../assets/countries.json';
	static url_comment_ca_marche = '/frequently-asked-questions/?json=1';
	

	/**
	 * Urls specific ti Vitrine Africaine app
	 */
	static url_listings = '/wp-json/wp/v2/listing'; // Listings here represents articles
	static url_media = '/wp-json/wp/v2/media'; // media are images and videos
	static url_pages = '/wp-json/wp/v2/pages'; // this are pages in the website
	static url_pointfinderreviews = '/wp-json/wp/v2/pointfinderreviews';
	static url_pftestimonials = '/wp-json/wp/v2/pftestimonials';
	static url_agents = '/wp-json/wp/v2/agents'; // agents
	static url_types = '/wp-json/wp/v2/types';
	static url_statuses = '/wp-json/wp/v2/statuses';
	static url_taxonomies = '/wp-json/wp/v2/taxonomies';
	static url_category = '/wp-json/wp/v2/categories';
	static url_tags = '/wp-json/wp/v2/tags';
	static url_pointfinderltypes = '/wp-json/wp/v2/pointfinderltypes'; // pointfinderltypes are categories
	static url_pointfinderlocations = '/wp-json/wp/v2/pointfinderlocations'; // pointfinderlocations are locations
	static url_pointfinderfeatures = '/wp-json/wp/v2/pointfinderfeatures';
	static url_pointfinderconditions = '/wp-json/wp/v2/pointfinderconditions';
	static url_users = '/wp-json/wp/v2/users'; // users are all the users in website
	static url_me = '/wp-json/wp/v2/users/me';
	static url_comments = '/wp-json/wp/v2/comments'; // comments are all the comments in website
	static url_taxonomy = '/wp-json/wp/v2/taxonomies';
}

export class ConfigModels {
	static tab_models = [
		
		'media',
		'comments',
		'users',
		'pointfinderconditions',
		//'events',
		//'tickets',
		//'venues',
		//'organizers',
		//'ev_categories',
		//'ev_tags',
		//'actualite',
		//'categorie_actu',
		// 'attendees',
		//'agents',
		'pointfinderreviews',
		'pftestimonials',
		'pointfinderfeatures',
		'tags',
		'pointfinderlocations',
		'listing',
		'pointfinderltypes',
	];
	static sync_tab_models = [
		'listing',
		'event',
		'pointfinderreviews',
		'pftestimonials',
		'media'
	]
}

export class Actions {
	static loadActions() {
		let liste = [
			{ id: 0, titre: 'Modifier', img: 'assets/icon/actions/edit.svg', slug: 'update' },
			{id: 1, titre: "Supprimer", img:"assets/icon/actions/garbage.svg", slug:"delete"},
			{ id: 2, titre: 'Voir', img: 'assets/icon/actions/view.svg', slug: 'view' },
		];

		return liste;
	}
}
export class ApiPaypal {
	static currency = 'EUR';
	static msgSuccess = 'Merci pour votre Don !';

	

	//Définition des messages erreurs ou de success lorsque
	//le paiement a été effectué ou pas
	static errorInit() {
		let objErr = {
			titre: 'PAYMENT',
			texte:
				'Impossible de procéder au paiement. Veuillez vérifier votre connexion Internet ou bien votre appareil ne supporte pas PayPal'
		};

		return objErr;
	}

	static errorSetting() {
		let objErr = {
			titre: 'PAYMENT',
			texte:
				"Impossible de procéder au paiement car une erreur est survenu durant la procédure. Contactez L'Association"
		};

		return objErr;
	}

	static cancelPayment() {
		let objErr = {
			titre: 'PAYMENT',
			texte: 'Vous avez annulé la procédure de paiement'
		};

		return objErr;
	}
}

export class SyncOptions {
	static syncTimer = 120000;
	static modelSyncTimer = 60000;
}

