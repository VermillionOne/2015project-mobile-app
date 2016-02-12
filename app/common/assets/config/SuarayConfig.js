/**
 * Suaray config options
 *
 * @type {Object}
**/
var suarayConfig = {
  userId: null,
  // Social ID's
  social: {
    keys: {
      facebook: '',
      twitter: '',
      instagram: '',
      google: ''
    }
  },
  // API Urls
  api: {
    // Production specific
    production: {
      baseUrl: 'https://api.suaray.com/v1/'
    },
    // Staging specific
    staging: {
      baseUrl: 'http://staging-api.suaray.com/v1/'
    },
    andreas: {
      baseUrl: 'http://andreas-api.suaray.com/v1/'
    },
    mojo: {
      baseUrl: 'http://mojo-api.suaray.com/v1/'
    },
    garrett: {
      baseUrl: 'http://garrett-api.suaray.com/v1/'
    }
  },
  // API Endpoints
  endpoints: {
    post: {
      // auth endpoints
      auth: {
        cb: 'auth/callback',
        twitter: 'account/login/twitter/callback',
        facebook: 'account/login/facebook/callback',
        instagram: 'account/login/instagram/callback',
        google: 'account/login/google/callback'
      },
      users: {
        tickets: 'ticketsorders/purchase',
        deposit: 'users/updateManaged/'
      },
      events: {
        polls: 'polls'
      }
    },
    get: {
      users: {
        uri: 'users',
        codes: 'tickets/user/',
        tickets: 'tickets/code',
        limit: 'users?limit=300',
        managed: 'users/showManaged/',
        orders: 'ticketsorders?with[]=tickets',
        userEvents: 'events?filter[and][][user_id]=',
        updates: '?with[]=updates.friend&fields[]=updates',
        accounts: '?with[]=stripeManagedAccounts&with[]=stripeSubscriptions',
        fields: '&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=username&fields[]=email',
        eventFields: '&sort[desc][]=created_at&limit=15&fields[]=id&fields[]=featuredPhoto&fields[]=title',
        friends: '?with[]=friends&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=avatar&fields[]=friends',
        friendRequests: '?with[]=friends&with[]=friendRequests&fields[]=id&fields[]=firstName&fields[]=lastName&fields[]=avatar&fields[]=friends&fields[]=friendRequests'
      },
      events: {
        uri: 'events',
        tags: 'events/featured/tags',
        invites: 'events/invites',
        tickets: 'ticketsinventories',
        attending: 'events/attending',
        featuredTags: 'events/featuredtags',
        carousel: 'events/featured/carousel',
        withTags: 'events?filter[and][][tags]=',
        fields: '?&fields[]=id&fields[]=title&fields[]=city&fields[]=state&fields[]=venueName&fields[]=featuredPhoto&fields[]=isSponsored&fields[]=userId',
        search: '?with[]=times&with[]=tags&filter[and][][is_published]=1&filter[and][][is_banned]=0&filter[and][][is_private]=0&fields[]=times&fields[]=tags&fields[]=id&fields[]=featuredPhoto&fields[]=title&fields[]=city&search=',
        featured: 'events?with[]=tags&with[]=times&filter[and][][is_published]=1&filter[and][][is_banned]=0&filter[and][][is_private]=0'
      },
      collections: {
        android: 'settings/android',
        categories: 'collections/categories',
        ios: 'settings/ios',
        mobile: 'settings/mobile',
        qr: 'qr/300?message=',
        upload: 'settings/upload',
        timezones: 'collections/timezones?limit=200&fields[]=id&fields[]=zoneName'
      }
    }
  },
  // Upload settings
  upload: {},
  // Views
  views: [
    'map',
    'edit',
    'home',
    'index',
    'crowd',
    'drawer',
    'create',
    'friends',
    'tickets',
    'ticket-reciept',
    'ticket-history',
    'credit-card',
    'event-detail',
    'advanced-search',
    'event-notification',
    'event-setup-details',
    'event-setup-freemium',
    'event-setup-option-polls',
    'event-setup-option-tickets',
    'event-setup-options',
    'profile',
    'payment',
    'tutorial',
    'my-events',
    'my-tickets',
    'notification',
    'search-results',
    'settings',
    'sign-up',
    'terms',
    'ticket-receipt',
    'profile-visitor-view'
  ]
};
