using AutoMapper;

namespace prid_tuto.Models;

/*
Cette classe sert à configurer AutoMapper pour lui indiquer quels sont les mappings possibles
et, le cas échéant, paramétrer ces mappings de manière déclarative (nous verrons des exemples plus tard).
*/
public class MappingProfile : Profile
{
    private MsnContext _context;

    /*
    Le gestionnaire de dépendance injecte une instance du contexte EF dont le mapper peut
    se servir en cas de besoin (ce n'est pas encore le cas).
    */
    public MappingProfile(MsnContext context) {
        _context = context;

        CreateMap<User, UserDTO>();
        CreateMap<UserDTO, User>();

        CreateMap<User, UserWithPasswordDTO>();
        CreateMap<UserWithPasswordDTO, User>();

        /*CreateMap<User, UserDTO>()
            .ForMember(dest => dest.BirthDate, opt => opt.MapFrom(src => src.BirthDate ?? DateTime.MinValue));*/
    }
}
