{
  pkgs,
  ...
}:

{
  packages = [
    pkgs.foundry
    pkgs.deno
  ];
  languages = {
    solidity.enable = true;
    deno.enable = true;
  };

  tasks = {
    "forge:deploy" = {
      exec = ''
        ${pkgs.foundry}/bin/forge create contracts/Voting.sol:Voting \
        --rpc-url http://localhost:8545 \
        --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'';
      # before = [ "devenv:processes:backend" ];
    };

    "forge:build" = {
      exec = ''
        ${pkgs.foundry}/bin/forge build
      '';
    };

  };

  processes = {
    anvil = {
      exec = "${pkgs.foundry}/bin/anvil";
    };

    backend = {
      exec = ''
        pushd backend
        deno run dev
      '';
      process-compose.depends_on = {
        "anvil".condition = "process_started";
      };
    };
  };
}
