class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :omniauthable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me
  attr_accessible :uid, :first_name, :last_name, :roles

  has_and_belongs_to_many :roles
  has_and_belongs_to_many :activities
  belongs_to :ticket
  belongs_to :referred_user, :class_name => "User", :foreign_key => :referred_user_id
  has_many :referrals

  validates_presence_of :email, :password

	def self.find_for_facebook_oauth(auth, signed_in_resource = nil)
		user = User.where(:email => auth.info.email).first
		unless user
			# CHECK FOR NEW/CREATE
			user = User.create(first_name:auth.info.first_name, last_name:auth.info.last_name, uid:auth.uid, email:auth.info.email, password:Devise.friendly_token[0,20])
		end
		user
	end

	def role?(role)
		return !!self.roles.find_by_name(role)
	end

	def add_activity activity_id
		self.activities << Activity.find(activity_id)
	end

	def add_referrals uid_list
		uid_list.each do |uid|
			begin
				self.referrals << Referral.create(:user_id => self.id, :referred_uid => uid, :accepted => false)
			rescue ActiveRecord::RecordNotUnique
				logger.info("UID #{uid} already existed in user's referrals.")
			end
		end
	end

	def accepted_referrals
		self.referrals.where("accepted = ?", true)	
	end

	def referrals_metric
		#TODO: review formula
		self.accepted_referrals.count/self.friend_count 
	end
end
