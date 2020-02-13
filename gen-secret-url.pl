use strict;
use Mojo::URL;
use Digest::MD5 qw/md5_hex/;

my $host = $ARGV[0];
my %config;
$config{u} = $ARGV[1];    #url
$config{w} = $ARGV[2];    #width
$config{h} = $ARGV[3];    #height
$config{rw} = $ARGV[4];    #resize width

my $secret = $ENV{BACKEND_SECRET_TOKEN} || $ARGV[-1];

die 'missing BACKEND_SECRET_TOKEN' if !$secret || $secret =~ /^\d+$/;
die 'invalid width'                if $config{w}      !~ /^\d+$/;
die 'invalid height'               if $config{h}     !~ /^\d+$/;

my $my_url = Mojo::URL->new($host);

my $calcBuffer = $secret . "\n";

for my $field (qw/u w h rw/) {
    $calcBuffer .= $field . '=' . $config{$field} . "\n";
    $my_url->query->merge($field, $config{$field});
}


use DDP;
p $calcBuffer;

my $calcSecret = md5_hex($calcBuffer);
$my_url->query->merge('a', $calcSecret);


use DDP;
p $my_url. '';