# name: discourse-contact-form
# about: Discourse Contact Form
# version: 0.1
# authors: Angus McLeod
# url: https://github.com/angusmcleod/discourse-contact-form

register_asset 'stylesheets/contact-form.scss'

after_initialize do
  load File.expand_path('../jobs/contact_email.rb', __FILE__)
  load File.expand_path('../mailers/contact_mailer.rb', __FILE__)

  module ::DiscourseContactForm
    class Engine < ::Rails::Engine
      engine_name "discourse_contact_form"
      isolate_namespace DiscourseContactForm
    end
  end

  Discourse::Application.routes.append do
    mount ::DiscourseContactForm::Engine, at: "contact"
  end

  DiscourseContactForm::Engine.routes.draw do
    post "send" => "contact#send_contact_email"
  end

  class DiscourseContactForm::ContactController < ::ApplicationController
    def send_contact_email
      contact = params.permit(:name, :email, :message).to_h

      begin
        Jobs.enqueue(:contact_email, to_address: SiteSetting.contact_email, contact: contact)
        render json: success_json
      rescue => e
        render json: { error: e }, status: 422
      end
    end
  end
end
