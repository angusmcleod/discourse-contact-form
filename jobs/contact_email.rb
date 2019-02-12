require_dependency 'email/sender'

module Jobs
  class ContactEmail < Jobs::Base
    def execute(args)
      raise Discourse::InvalidParameters.new(:to_address) unless args[:to_address].present?
      puts "HERE IS THE #{args.inspect}"
      message = ContactMailer.contact_email(args[:to_address], args[:contact])
      Email::Sender.new(message, :contact_email).send
    end
  end
end
